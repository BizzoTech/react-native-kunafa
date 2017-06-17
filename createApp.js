import React, {Component} from 'react';
import {DeviceEventEmitter, AppRegistry, View, Linking} from 'react-native';
import {Provider} from 'react-redux';

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

import AppContainer from './AppContainer';

export default (name, MAIN, appConfig) => {
  const {host, localUsername, localPassword} = appConfig;
  RNKunafa.init(host, localUsername, localPassword);
  RNKunafa.host = host;
  RNKunafa.publicDb = new PouchDB(`http://${host}/public`, {
		ajax: {
			timeout: 60000
		}
	});
  let AppStore = null;
  const App = React.createClass({
      getInitialState :function() {
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
  	          AppStore = createStore({...appConfig, profileId, port});

              setTimeout(()=>{
                appConfig.initialFetch(AppStore);
              }, 500);


              Linking.getInitialURL().then((url) => {
        				if (url) {
        					//console.log('Initial url is: ' + url);
                  appConfig.handleDeepLink(url, AppStore);
        				}
        			}).catch(err => console.error('An error occurred', err));
        			Linking.addEventListener('url', this._handleOpenURL);

              DeviceEventEmitter.addListener("NotificationClick", docId => {
                if(docId){
                  appConfig.handleNotificationClick(docId, AppStore);
                }
              });
              setTimeout(()=>{
                RNKunafa.getInitialNotificationClickDocId(docId => {
                  if(docId){
                    appConfig.handleNotificationClick(docId, AppStore);
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
  			appConfig.handleDeepLink(event.url, AppStore);
  		},
  		render(){
  			if(this.state.splash){
  				return <View />;
  			}
  			return (
  				<View style={{flex: 1, backgroundColor:"white"}}>
  					<Provider store={AppStore}>
              <AppContainer Main={MAIN} appConfig={appConfig} store={AppStore} />
            </Provider>
  				</View>
  			)
  		}
  })

  AppRegistry.registerComponent(name, () => App);
}
