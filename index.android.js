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
  TextInput
} from 'react-native';

import './shim.js';
import OAuth from './config/oauth';

export default class TestProject extends Component {


  constructor(props)
  {
    super(props);
    this.state = {
      buttonColor : '#0084b4',
      pin : '',
      reqtoken : ''
    }

    this.twitterLogin = this.twitterLogin.bind(this);
    this.submitPIN = this.submitPIN.bind(this);
  }

  //just checking if this works
  


  generateOAuthNonce(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }


  generateTimeStamp()
  {
    return (Math.floor(Date.now()/1000));
  }


  twitterLogin()
  {
    var url = 'https://api.twitter.com/oauth/request_token';

    var NONCE=this.generateOAuthNonce(32);
    var SIGNATURE_METHOD = 'HMAC-SHA1';
    var TIMESTAMP = this.generateTimeStamp();
    var CONSUMER_KEY=OAuth.CONSUMER_KEY;//'flHWHDDXaErTcRdKz2EEGDrJc';
    var SIGNATURE;
    var VERSION = '1.0'

    var parameterString = 'oauth_consumer_key=' + CONSUMER_KEY +
    '&oauth_nonce=' + NONCE + '&oauth_signature_method=' + SIGNATURE_METHOD +
    '&oauth_timestamp=' + TIMESTAMP + '&oauth_version=1.0';

    var signatureBaseString = 'POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Frequest_token&' + encodeURIComponent(parameterString);
    console.log(signatureBaseString);

    var hmacsha1 = require('hmacsha1');
    var hash = hmacsha1(OAuth.CONSUMER_SECRET + '&', signatureBaseString);
    SIGNATURE = encodeURIComponent(hash);
    console.log(SIGNATURE);

    var authorization_header_string = 'OAuth oauth_consumer_key=\"' + CONSUMER_KEY + '\", oauth_signature_method=\"HMAC-SHA1\", oauth_timestamp=\"' +
    TIMESTAMP + '\", oauth_nonce=\"' + NONCE + '\", oauth_version=\"1.0\", oauth_signature=\"' + SIGNATURE + '\"';

    console.log(authorization_header_string);


    console.log(authorization_header_string);

    var options = {
      method:'POST',
      headers:{
        'Authorization': authorization_header_string
      }

    }


    //console.log(fetch('https://api.twitter.com/oauth/request_token',options).then((res)=>res.formData()).then((re) => re._parts[0][1]));
    fetch('https://api.twitter.com/oauth/request_token',options)
    .then((res)=>res.formData())
    .then(function(re){
      var request_token = re._parts[0][1];
      Linking.openURL('https://api.twitter.com/oauth/authenticate?oauth_token=' + request_token).catch(err => console.error('An error occurred', err));
      this.setState({reqtoken : request_token});
      //console.log(re._parts);

    }.bind(this));

  }

  submitPIN(){
      console.log(this.state.pin);
      console.log(this.state.reqtoken);

      var url = 'https://api.twitter.com/oauth/request_token';

      var NONCE=this.generateOAuthNonce(32);
      var SIGNATURE_METHOD = 'HMAC-SHA1';
      var TIMESTAMP = this.generateTimeStamp();
      var CONSUMER_KEY=OAuth.CONSUMER_KEY;
      var SIGNATURE;
      var VERSION = '1.0'

      var parameterString = 'oauth_consumer_key=' + CONSUMER_KEY +
      '&oauth_nonce=' + NONCE + '&oauth_signature_method=' + SIGNATURE_METHOD +
      '&oauth_timestamp=' + TIMESTAMP + '&oauth_token=' + this.state.reqtoken + '&oauth_version=1.0';

      var signatureBaseString = 'POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Faccess_token&' + encodeURIComponent(parameterString);
      //console.log(signatureBaseString);


      var hmacsha1 = require('hmacsha1');
      var hash = hmacsha1(OAuth.CONSUMER_SECRET +'&', signatureBaseString); //check whether to add token secret or not and content type
      SIGNATURE = encodeURIComponent(hash);
      console.log(SIGNATURE);

      var authorization_header_string = 'OAuth oauth_consumer_key=\"' + CONSUMER_KEY + '\", oauth_signature_method=\"HMAC-SHA1\", oauth_timestamp=\"' +
      TIMESTAMP + '\", oauth_nonce=\"' + NONCE + '\", oauth_version=\"1.0\", oauth_signature=\"' + SIGNATURE + '\", oauth_token=\"' + this.state.reqtoken + '\", oauth_verifier=\"' + this.state.pin + '\"';

      console.log(authorization_header_string);


      console.log(authorization_header_string);

      var options = {
        method:'POST',
        headers:{
          'Authorization': authorization_header_string
        }


      }

      fetch('https://api.twitter.com/oauth/access_token',options)
      .then((res)=>res.formData())
      .then(function(re){
        console.log(re);
      }.bind(this));



  }






  render() {
    return (
      <View style={styles.container}>
      <Text style={styles.welcome}>
      Welcome to React Native!
      </Text>
      <Text style={styles.instructions}>
      To get started, edit index.android.js
      </Text>
      <Text style={styles.instructions}>
      Double tap R on your keyboard to reload,{'\n'}
      Shake or press menu button for dev menu{'\n'}
      </Text>
      <Button
      onPress = {this.twitterLogin}
      title='Sign in with Twitter'
      color={this.state.buttonColor}
      />
      <TextInput
      style={{height: 40, width : 150, borderColor: 'red', borderWidth: 1}}
      onChangeText={(text) => this.setState({pin : text})}
      />
      <Button
      onPress = {this.submitPIN}
      title = 'Submit'
      />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
