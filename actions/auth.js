import RNKunafa from '../RNKunafa';

import {reLoadDoc} from './documents';

export const skipLogin = () => {
	return {type: 'SKIP_LOGIN'}
}

function login(hostUrl, user) {
	//console.log(user);
	return fetch(hostUrl + "/_session", {
		method: 'POST',
		body: JSON.stringify(user),
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
	})
}

function fetchUser(hostUrl, user_id) {
	const url = hostUrl + "/_users/" + user_id;
	return fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	}).then(function(response) {
		if (response.status == 200) {
			return response.json();
		} else {
			throw new Error("Request Error");
		}
	})
}

export const startLoading = () => {
	return {type: 'START_LOADING'}
}

export const userLogin = (name, password) => {
	return dispatch => {
		dispatch({type: 'START_LOADING'})
		login(`http://${RNKunafa.host}`, {name, password}).then((user) => {
			//console.log(user)
			const userId = 'org.couchdb.user:' + user.name;
			return fetchUser(`http://${RNKunafa.host}`, userId);
		}).then(user => {
			RNKunafa.login(name, password, user.profileId);
			return user;
		}).then(user => {
			dispatch(reLoadDoc({_id: user.profileId}));
			RNKunafa.onLogin(() => {
				dispatch({type: 'LOGIN', profileId: user.profileId})
			})
		})
	}
}

export const userLogout = () => {
	return dispatch => {
		dispatch({type: 'START_LOADING'});
		RNKunafa.logout();
		RNKunafa.onLogout(() => {
			RNRestart.Restart();
		})
	}

}
