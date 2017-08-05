import React, {Component} from 'react';
import {AppRegistry, View} from 'react-native';
import {Provider} from 'react-redux';
import Config from 'react-native-config';

const FBSDK = require('react-native-fbsdk');
const {LoginButton, AccessToken, LoginManager} = FBSDK;

import PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-find'));

import RNKunafa from './RNKunafa';
import createStore from './createStore';
import actions from './actions';

import AppContainer from './AppContainer';

export default(name, MAIN, appConfig) => {
  RNKunafa.appConfig = {
    ...appConfig,
    ...Config
  }
  RNKunafa.actions = {
    ...actions,
    ...appConfig.appActions
  }
  RNKunafa.AppStore = null;
  class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        splash: true,
        listenerStarted: false,
        port: 1000
      };
    }
    componentDidMount = () => {
      RNKunafa.onListnerStarted(port => {
        console.log("LISTNETR_STARTED " + port);
        this.setState({listenerStarted: true, port});
      });
      setTimeout(() => {
        this.checkListner();
      }, 500);
    }
    checkListner = () => {
      const {splash, listenerStarted, port} = this.state;
      if (splash) {
        if (listenerStarted) {
          RNKunafa.getProfileId(profileId => {
            if (!profileId) {
              LoginManager.logOut();
            }
            RNKunafa.AppStore = createStore({
              ...RNKunafa.appConfig,
              profileId,
              port
            });

            setTimeout(() => {
              RNKunafa.appConfig.initialFetch(RNKunafa.AppStore);
            }, 500);

            setTimeout(() => {
              this.setState({splash: false});
            }, 500)

          })
        } else {
          setTimeout(this.checkListner, 100);
        }
      }
    }
    render = () => {
      if (this.state.splash) {
        return <View/>;
      }
      return (
        <View style={{
          flex: 1,
          backgroundColor: "white"
        }}>
          <Provider store={RNKunafa.AppStore}>
            <AppContainer Main={MAIN}/>
          </Provider>
        </View>
      )
    }
  }

  AppRegistry.registerComponent(name, () => App);
}
