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
  Navigator
} from 'react-native';

//import './shim.js';
//import OAuth from './config/oauth';
import Root from './root';
import OAuth from './config/oauth';

export default class Home extends Component {

  constructor(props){
    super(props);

    this.state = {
      tweet : ''
    }

    this.onTweetPress = this.onTweetPress.bind(this);
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

  render() {
    return (
      <View style = {styles.container}>
        <Text style={styles.welcome}>
          Welcome!
        </Text>
        <TextInput
          onChangeText={(text) => this.setState({tweet : text})}
          style={{height: 40, width : 340, borderColor: 'red', borderWidth: 1, margin : 10}}
          multiline = {true}
          numberOfLines = {3}
        />
        <Button
          title = 'Post Tweet'
          onPress = {this.onTweetPress}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
