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
  Navigator
} from 'react-native';


import Root from './root';
import Home from './home';

const Realm = require('realm');

class TestProject extends Component {




  renderScene(route, navigator) {
    console.log(route);
    if (route.name=='root'){
      console.log('Am I here');
      return <Root navigator = {navigator} />
    }
    else if (route.name=='home'){
      console.log('check');
      console.log(route.oauth_token);
      console.log(route.oauth_token_secret);
      return <Home navigator = {navigator} oauth_token={route.oauth_token} oauth_token_secret={route.oauth_token_secret} screen_name={route.screen_name}/>
    }

  }



  render() {
    return (
      <View style={styles.container}>
      <Navigator
      initialRoute = {{name: 'root'}}
      renderScene={this.renderScene.bind(this)}
      />
      </View>
    );
  }
 //  render() {
 //
 //   let realm = new Realm({
 //     schema: [{name: 'Dog', properties: {name: 'string'}}]
 //   });
 //
 //   realm.write(() => {
 //     realm.create('Dog', {name: 'Rex'});
 //     realm.deleteAll();
 //   });
 //
 //  console.log(realm.objects('Dog'));
 //
 //   return (
 //     <View style={styles.container}>
 //       <Text style={styles.welcome}>
 //         Count of Dogs in Realm: {realm.objects('Dog').length}
 //       </Text>
 //     </View>
 //   );
 // }

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
