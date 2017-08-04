import React, {Component} from 'react';
import {DeviceEventEmitter, AppRegistry, View, Linking} from 'react-native';
import {Provider} from 'react-redux';
import Config from 'react-native-config';

const FBSDK = require('react-native-fbsdk');
const {
  LoginButton,
	AccessToken,
	LoginManager
} = FBSDK;

import PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-find'));

import RNKunafa from './RNKunafa';
import createStore from './createStore';
import actions from './actions';

import AppContainer from './AppContainer';

export default (name, MAIN, appConfig) => {
  RNKunafa.appConfig = {
    ...appConfig,
    ...Config
  }
  RNKunafa.actions = {
    ...actions,
    ...appConfig.appActions
  }
  RNKunafa.AppStore = null;
  const App = React.createClass({
      getInitialState() {
        return {
          splash : true,
  				listenerStarted: false,
  				port: 1000
        };
      },
  		componentDidMount(){
        RNKunafa.onListnerStarted(port => {
  			    console.log("LISTNETR_STARTED " + port);
  					this.setState({
  						listenerStarted: true,
  						port
  					});
  			});
  			setTimeout(() =>{
          this.checkListner();
        },500);
  		},
  		checkListner(){
        const {splash, listenerStarted, port} = this.state;
  			if(splash){
  				if(listenerStarted){
            RNKunafa.getProfileId(profileId => {
              if(!profileId){
                LoginManager.logOut();
              }
  	          RNKunafa.AppStore = createStore({...RNKunafa.appConfig, profileId, port});

              setTimeout(()=>{
                RNKunafa.appConfig.initialFetch(RNKunafa.AppStore);
              }, 500);


              Linking.getInitialURL().then((url) => {
        				if (url) {
        					//console.log('Initial url is: ' + url);
                  RNKunafa.appConfig.handleDeepLink(url, RNKunafa.AppStore);
        				}
        			}).catch(err => console.error('An error occurred', err));
        			Linking.addEventListener('url', this._handleOpenURL);

              DeviceEventEmitter.addListener("NotificationClick", docId => {
                if(docId){
                  RNKunafa.appConfig.handleNotificationClick(docId, RNKunafa.AppStore);
                }
              });
              setTimeout(()=>{
                RNKunafa.getInitialNotificationClickDocId(docId => {
                  if(docId){
                    RNKunafa.appConfig.handleNotificationClick(docId, RNKunafa.AppStore);
                  }
                })
              }, 500);
              setTimeout(() => {
                this.setState({splash: false});
              },500)

            })
  				}else{
  					setTimeout(this.checkListner, 100);
  				}
  			}
  		},
      componentWillUnmount() {
  			Linking.removeEventListener('url', this._handleOpenURL);
  		},
  		_handleOpenURL(event) {
  			//console.log(event.url);
  			RNKunafa.appConfig.handleDeepLink(event.url, RNKunafa.AppStore);
  		},
  		render(){
  			if(this.state.splash){
  				return <View />;
  			}
  			return (
  				<View style={{flex: 1, backgroundColor:"white"}}>
  					<Provider store={RNKunafa.AppStore}>
              <AppContainer Main={MAIN} />
            </Provider>
  				</View>
  			)
  		}
  })

  AppRegistry.registerComponent(name, () => App);
}
