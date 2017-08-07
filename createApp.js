import React, {Component} from 'react';
import {AppRegistry, View} from 'react-native';
import {Provider} from 'react-redux';
import Config from 'react-native-config';
import R from 'ramda';

const FBSDK = require('react-native-fbsdk');
const {LoginButton, AccessToken, LoginManager} = FBSDK;

import PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-find'));

import createStore from 'kunafa-client/createStore';

import RNKunafa from './RNKunafa';
import actions from './actions';

import pkgMiddlewares from './middlewares';

import pkgReducers from './reducers';

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

            const localUsername = Config.LOCAL_USERNAME || "kunafa";
            const localPassword = Config.LOCAL_PASSWORD || "kunafa";

            const localListnerUrl = `http://${localUsername}:${localPassword}@127.0.0.1:${port}/`;

            const paths = R.append({
              name: "events",
              filter: function (doc) {
                return doc.type == "EVENT"; // & !doc.appliedOnClient;
              },
              actions: {
                remove: 'REMOVE_EVENT',
                update: 'UPDATE_EVENT',
                insert: 'ADD_EVENT',
                load: 'LOAD_EVENTS'
              }
            }, appConfig.syncPaths || [])

            RNKunafa.AppStore = createStore({
              ...appConfig,
              profileId,
              port,
              reducers: {
                ...appConfig.appReducers,
                ...pkgReducers
              },
              middlewares: [...appConfig.appMiddlewares, ...pkgMiddlewares],
              localListnerUrl,
              paths
            });

            setTimeout(() => {
              const initialActions = RNKunafa.appConfig.getInitialActions(RNKunafa.AppStore.getState);
              initialActions.forEach(RNKunafa.AppStore.dispatch);
            }, 500);
            this.setState({splash: false});
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
        <Provider store={RNKunafa.AppStore}>
          <AppContainer Main={MAIN}/>
        </Provider>
      )
    }
  }

  AppRegistry.registerComponent(name, () => App);
}
