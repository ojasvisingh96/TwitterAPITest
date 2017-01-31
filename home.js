/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  Linking,
  TextInput,
  Navigator,
  ListView
} from 'react-native';

//import './shim.js';
//import OAuth from './config/oauth';
import Root from './root';
import OAuth from './config/oauth';

const Realm = require('realm');

export default class Home extends Component {

  constructor(props){
    super(props);

    const ds = new ListView.DataSource({rowHasChanged : (r1,r2) => r1!==r2});

    this.state = {
      tweet : '',
      tweets : [],
      dataSource: ds.cloneWithRows([])
    }

    this.onTweetPress = this.onTweetPress.bind(this);
    this.onFetchPress = this.onFetchPress.bind(this);
  }

  onTweetPress(){

    console.log('check');

    var url = 'https://api.twitter.com/1.1/statuses/update.json';

    var NONCE=OAuth.generateOAuthNonce(32);
    var SIGNATURE_METHOD = 'HMAC-SHA1';
    var TIMESTAMP = OAuth.generateTimeStamp();
    var CONSUMER_KEY=OAuth.CONSUMER_KEY;
    var SIGNATURE;
    var VERSION = '1.0'

    //need access token and access secret
    var parameterString = 'oauth_consumer_key=' + CONSUMER_KEY +
    '&oauth_nonce=' + NONCE + '&oauth_signature_method=' + SIGNATURE_METHOD +
    '&oauth_timestamp=' + TIMESTAMP + '&oauth_token=' + this.props.oauth_token + '&oauth_version=1.0' + '&status=' + encodeURIComponent(this.state.tweet);

     var signatureBaseString = 'POST&https%3A%2F%2Fapi.twitter.com%2F1.1%2Fstatuses%2Fupdate.json&' + encodeURIComponent(parameterString);
    console.log(signatureBaseString);


     var hmacsha1 = require('hmacsha1');
     var hash = hmacsha1(OAuth.CONSUMER_SECRET + '&' + this.props.oauth_token_secret, signatureBaseString); //check whether to add token secret or not and content type
     SIGNATURE = encodeURIComponent(hash);
     //console.log(SIGNATURE);

     var authorization_header_string = 'OAuth oauth_consumer_key=\"' + CONSUMER_KEY + '\", oauth_signature_method=\"HMAC-SHA1\", oauth_timestamp=\"' +
     TIMESTAMP + '\", oauth_nonce=\"' + NONCE + '\", oauth_version=\"1.0\", oauth_signature=\"' + SIGNATURE + '\", oauth_token=\"' + this.props.oauth_token + '\"';

     console.log(authorization_header_string);

    var options = {
      method:'POST',
      headers:{
        'Authorization': authorization_header_string,
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      body : 'status=' + encodeURIComponent(this.state.tweet)


    }

    fetch('https://api.twitter.com/1.1/statuses/update.json',options)
    .then((res)=>res.json())
    .then(function(re){
      console.log(re);
    }.bind(this));
  }

  onFetchPress(){
    console.log('checkFetch');

    let realm = new Realm({
      schema : [{name : 'Tweet',
        primaryKey : 'id',
        properties : {id : 'string', text : 'string'}}]
    });


    var NONCE=OAuth.generateOAuthNonce(32);
    var SIGNATURE_METHOD = 'HMAC-SHA1';
    var TIMESTAMP = OAuth.generateTimeStamp();
    var CONSUMER_KEY=OAuth.CONSUMER_KEY;
    var SIGNATURE;
    var VERSION = '1.0'

    //need access token and access secret
    var parameterString = 'count=3' + '&oauth_consumer_key=' + CONSUMER_KEY +
    '&oauth_nonce=' + NONCE + '&oauth_signature_method=' + SIGNATURE_METHOD +
    '&oauth_timestamp=' + TIMESTAMP + '&oauth_token=' + this.props.oauth_token + '&oauth_version=1.0' + '&screen_name=' + this.props.screen_name; //'&since_id='; //+ realm.objects('Tweet').sorted('id', true)[0].id;

    if (realm.objects('Tweet').length>0){
      parameterString = parameterString.concat('&since_id=', realm.objects('Tweet').sorted('id',true)[0].id);
    }

     var signatureBaseString = 'GET&' + encodeURIComponent('https://api.twitter.com/1.1/statuses/user_timeline.json') + '&' + encodeURIComponent(parameterString);
    console.log(signatureBaseString);


     var hmacsha1 = require('hmacsha1');
     var hash = hmacsha1(OAuth.CONSUMER_SECRET + '&' + this.props.oauth_token_secret, signatureBaseString); //check whether to add token secret or not and content type
     SIGNATURE = encodeURIComponent(hash);
     //console.log(SIGNATURE);

     var authorization_header_string = 'OAuth oauth_consumer_key=\"' + CONSUMER_KEY + '\", oauth_signature_method=\"HMAC-SHA1\", oauth_timestamp=\"' +
     TIMESTAMP + '\", oauth_nonce=\"' + NONCE + '\", oauth_version=\"1.0\", oauth_signature=\"' + SIGNATURE + '\", oauth_token=\"' + this.props.oauth_token + '\"';

     console.log(authorization_header_string);

    var options = {
      method:'GET',
      headers:{
        'Authorization': authorization_header_string,
        'Content-Type' : 'application/x-www-form-urlencoded'
      }

    }

    var fetchURL = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=3&screen_name=' + this.props.screen_name;

    if (realm.objects('Tweet').length>0){
      fetchURL = fetchURL.concat('&since_id=', realm.objects('Tweet').sorted('id',true)[0].id);
    }


    fetch(fetchURL ,options) //+ realm.objects('Tweet').sorted('id', true)[0].id, options)
    .then((res) => res.json())
    .then(function(re){
      //console.log(re[0].id_str);
      console.log(re);
      console.log(re.length);
      var tweets = this.state.tweets.slice();
      for (var i = re.length-1 ; i >= 0 ; i--)
      {
        tweets.unshift(re[i].text);
      }
      this.setState({tweets : tweets});
      const ds = new ListView.DataSource({rowHasChanged : (r1,r2) => r1!==r2});
      this.setState({dataSource : ds.cloneWithRows(tweets)});
      //console.log(re[0].text);

      realm.write(() => {
        for (var i = 0 ; i < re.length ; i++)
        {
          realm.create('Tweet', {id : re[i].id_str, text : re[i].text});
        }
      });
      //onsole.log(realm.objects('Tweet').sorted('id', true)[0].id);
      //console.log(realm.objects('Tweet').sorted('id', true)[1].id);

    }.bind(this));


    // var tweets = this.state.tweets.slice();
    // tweets.push('lol');
    // this.setState({tweets : tweets});
    // console.log(this.state.tweets);
    //
    // const ds = new ListView.DataSource({rowHasChanged : (r1,r2) => r1!==r2});
    // this.setState({dataSource : ds.cloneWithRows(this.state.tweets)});

  }

  render() {




    return (
      <View style = {{flexDirection : 'column', padding:40}}>
      <View>
        <Text style = {styles.welcome}> Welcome </Text>
        <TextInput
          onChangeText={(text) => this.setState({tweet : text})}
          style={{height: 40, borderColor: 'red', borderWidth: 1, margin : 10}}
          numberOfLines = {3}
          multiline = {true}
        />
        <Button
          title = 'Post Tweet'
          onPress = {this.onTweetPress}
        />
        <Button
          title = 'Fetch Timeline'
          onPress = {this.onFetchPress}
        />
      </View>
      <ListView
        enableEmptySections={true}
        dataSource = {this.state.dataSource}
        renderRow = {(rowData) => <Text>{rowData}</Text>}
      />
      </View>


    );
  }
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
