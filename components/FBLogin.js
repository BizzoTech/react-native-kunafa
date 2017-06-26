import React, { Component } from 'react';
import {
Dimensions,
} from 'react-native';
import Config from 'react-native-config';

import { connect } from 'react-redux';
import actions from '../actions';
import { bindActionCreators } from 'redux';
const {height, width} = Dimensions.get('window');

const FBSDK = require('react-native-fbsdk');
const {
  LoginButton,
	AccessToken,
	LoginManager
} = FBSDK;

import RNKunafa from '../RNKunafa';

const getCredentials = async() => {
  const data = await AccessToken.getCurrentAccessToken();
  const response = await fetch(`http://${Config.HOST}/facebook`, {
    method: 'POST',
    body: JSON.stringify({accessToken: data.accessToken.toString()}),
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
  });
  if (response.status == 200) {
      return response.json();
  } else {
      console.log(response);
      throw new Error("Login Error");
  }
}


const FBLogin = React.createClass({
	onLoginFinished(error, result){
		if (error || result.isCancelled) {
			console.log(result);
		} else {
			//alert("Login was successful with permissions: " + result.grantedPermissions)
			//console.log(result);
			this.props.startLoading();
      getCredentials().then(creds => {
        this.props.userLogin(creds.name, creds.password, creds.event);
      }).catch(err => {
				alert("Error while login, please try again later");
				LoginManager.logOut();
				this.props.resetHistory();
			});
		}
	},
	onLogoutFinished(){
		//alert("User logged out")
		this.props.userLogout();
	},
  render(){
    const {style, permissions} = this.props;
    return(
			<LoginButton
				readPermissions={permissions || ["email","public_profile", "user_friends"]}
				onLoginFinished={this.onLoginFinished}
				onLogoutFinished={this.onLogoutFinished}
				style={style}/>
    );
  }
});


export default connect(null, dispatch => {
	return bindActionCreators(actions, dispatch);
})(FBLogin);
