/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Navigator,
  ListView,
  RefreshControl,
  Image
} from 'react-native';


import Root from './root';
import Home from './home';

import OAuth from './config/oauth';

const Realm = require('realm');

export default class Timeline extends Component {

  constructor(props){
    super(props);

    const ds = new ListView.DataSource({rowHasChanged : (r1,r2) => r1!==r2});

    this.state = {
      refreshing : false,
      tweet : '',
      tweets : [],
      pics : [],
      arr : [[]],
      dataSource: ds.cloneWithRows([])
    }

    let realm = new Realm({
      schema : [{name : 'Timeline',
        primaryKey : 'id',
        properties : {id : 'string', text : 'string', screen_name : 'string', pic : 'string'}}]
    });

    realm.write(() => {
      realm.deleteAll();
    });

    this.fetchTimeline = this.fetchTimeline.bind(this);

  }


  componentWillMount(){
    this.fetchTimeline();
  }

  async fetchTimeline(){

    let realm = new Realm({
      schema : [{name : 'Timeline',
        primaryKey : 'id',
        properties : {id : 'string', text : 'string', screen_name : 'string', pic : 'string'}}]
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
    '&oauth_timestamp=' + TIMESTAMP + '&oauth_token=' + this.props.oauth_token + '&oauth_version=1.0'; //'&since_id='; //+ realm.objects('Tweet').sorted('id', true)[0].id;

    if (realm.objects('Timeline').length>0){
      parameterString = parameterString.concat('&since_id=', realm.objects('Timeline').sorted('id',true)[0].id);
    }

     var signatureBaseString = 'GET&' + encodeURIComponent('https://api.twitter.com/1.1/statuses/home_timeline.json') + '&' + encodeURIComponent(parameterString);
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

    var fetchURL = 'https://api.twitter.com/1.1/statuses/home_timeline.json?count=3';

    if (realm.objects('Timeline').length>0){
      fetchURL = fetchURL.concat('&since_id=', realm.objects('Timeline').sorted('id',true)[0].id);
    }


    fetch(fetchURL, options)
    .then((res) => res.json())
    .then(function(re){

      var arr = this.state.arr.slice();

      var tweets = this.state.tweets.slice();
      var pics = this.state.pics.slice();
      for (var i = re.length-1 ; i >=0  ; i--){
        pics.unshift('https' + re[i].user.profile_image_url.slice(4));
        tweets.unshift(re[i].text);
        arr.unshift([re[i].text,'https' + re[i].user.profile_image_url.slice(4)]);
      }
      this.setState({pics : pics});
      this.setState({tweets : tweets});
      this.setState({arr : arr});




      const ds = new ListView.DataSource({rowHasChanged : (r1,r2) => r1!==r2});
      console.log(tweets);
      console.log(pics);
      this.setState({dataSource : ds.cloneWithRows(arr)});

      console.log(re);

      realm.write(() => {
        for (var i = 0 ; i < re.length ; i++)
        {
          realm.create('Timeline', {id : re[i].id_str, text : re[i].text, screen_name : re[i].user.screen_name, pic : re[i].user.profile_image_url});
        }
      });


    }.bind(this));


  }


  _onRefresh() {
    this.setState({refreshing : true});
    this.fetchTimeline().then(() => {
      this.setState({refreshing : false});
    });
  }


  render() {
    return (
      <View style={{padding:20}}>
        <View>
        <ListView
          enableEmptySections={true}
          dataSource = {this.state.dataSource}
          renderRow = {(rowData) =>
            <View style = {{flex :1, flexDirection : 'row'}}>
            <Image style = {{flex : 1, width: 20, height: 20}} source = {{uri : rowData[1]}} />
            <Text style ={{flex:20}}>{rowData[0]}</Text>
            </View>
          }
          refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
        />
        </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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

AppRegistry.registerComponent('TestProject', () => TestProject);
