import React, { Component } from 'react';
import { AppRegistry, View, NetInfo } from 'react-native';
import { Provider } from 'react-redux';
import Config from 'react-native-config';
import R from 'ramda';

const FBSDK = require('react-native-fbsdk');
const { LoginButton, AccessToken, LoginManager } = FBSDK;

import { createStore } from 'kunafa-client/src';

import RNKunafa from './RNKunafa';
import actionCreators from './actionCreators';

import AppContainer from './AppContainer';

import deviceInfo from './device_info';
import cacheStore from './cacheStore';

import I18n from 'react-native-i18n';
I18n.fallbacks = true;

export default ((name, MAIN, appConfig) => {
  I18n.translations = appConfig.translations;
  RNKunafa.AppStore = null;
  class App extends Component {
    constructor(props) {
      super(props);

      this.componentDidMount = () => {
        RNKunafa.onListnerStarted(port => {
          console.log("LISTNETR_STARTED " + port);
          this.setState({ listenerStarted: true, port });
        });
        setTimeout(() => {
          this.checkListner();
        }, 500);
      };

      this.checkListner = () => {
        const { splash, listenerStarted, port } = this.state;
        if (splash) {
          if (listenerStarted) {
            RNKunafa.getProfileId(profileId => {
              if (!profileId) {
                LoginManager.logOut();
              }

              const localUsername = Config.LOCAL_USERNAME || "kunafa";
              const localPassword = Config.LOCAL_PASSWORD || "kunafa";

              const localListnerUrl = `http://${localUsername}:${localPassword}@127.0.0.1:${port}/`;

              const config = Object.assign({}, appConfig, Config, {
                profileId,
                port,
                actionCreators: Object.assign({}, actionCreators, appConfig.actionCreators),
                getLocalDbUrl: profileId => {
                  const dbName = profileId || "anonymous";
                  return localListnerUrl + dbName + "-" + Config.BUILD_TYPE;
                },
                deviceInfo,
                cacheStore,
                isConnected: async () => {
                  return await NetInfo.isConnected.fetch();
                }
              });

              const AppStore = createStore(config);
              RNKunafa.AppStore = AppStore;
              RNKunafa.appConfig = config;

              this.setState({ splash: false });
            });
          } else {
            setTimeout(this.checkListner, 100);
          }
        }
      };

      this.render = () => {
        if (this.state.splash) {
          return React.createElement(View, null);
        }
        return React.createElement(
          Provider,
          { store: RNKunafa.AppStore },
          React.createElement(AppContainer, { Main: MAIN })
        );
      };

      this.state = {
        splash: true,
        listenerStarted: false,
        port: 1000
      };
    }
  }

  AppRegistry.registerComponent(name, () => App);
});