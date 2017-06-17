import React, { Component } from 'react';
import {
Dimensions,
} from 'react-native';

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

const FBLogin = React.createClass({
	onLoginFinished(error, result){
		if (error || result.isCancelled) {
			console.log(result);
		} else {
			//alert("Login was successful with permissions: " + result.grantedPermissions)
			//console.log(result);
			this.props.startLoading();
			AccessToken.getCurrentAccessToken().then(data => {
				//alert(data.accessToken.toString())
				return fetch(`http://${RNKunafa.host}/facebook`, {
					method: 'POST',
					body: JSON.stringify({accessToken: data.accessToken.toString()}),
					headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
					}
				}).then(function(response) {
						//console.log(response);
						if (response.status == 200) {
								return response.json();
						} else {
								console.log(response);
								throw new Error("Login Error");
						}
				}).then(response => {
					//console.log(response);
					return this.props.userLogin(response.name, response.password);
				})
			}).catch(err => {
				alert("Error while login, please try again later");
				LoginManager.logOut();
				//this.props.resetHistory();
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
