import RNKunafa from '../RNKunafa';

import {
  reLoadDoc
} from './documents';

export const skipLogin = () => {
  return {
    type: 'SKIP_LOGIN'
  }
}

const login = async(hostUrl, user) => {
  //console.log(user);
  const response = await fetch(hostUrl + "/_session", {
    method: 'POST',
    body: JSON.stringify(user),
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

const fetchUser = async(hostUrl, user_id) => {
  const url = hostUrl + "/_users/" + user_id;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
  if (response.status == 200) {
    return response.json();
  } else {
    throw new Error("Request Error");
  }
}

const auth = async(name, password) => {
  const session = await login(`http://${RNKunafa.host}`, {
    name,
    password
  });
  const userId = 'org.couchdb.user:' + session.name;
  return await fetchUser(`http://${RNKunafa.host}`, userId);
}

export const startLoading = () => {
  return {
    type: 'START_LOADING'
  }
}

export const userLogin = (name, password) => {
  return dispatch => {
    dispatch({
      type: 'START_LOADING'
    })
    auth(name, password).then(user => {
      RNKunafa.login(name, password, user.profileId);
      dispatch(reLoadDoc({
        _id: user.profileId
      }));
      RNKunafa.onLogin(() => {
        dispatch({
          type: 'LOGIN',
          profileId: user.profileId
        })
      })
    }).catch(e => {
      console.log(e);
    });
  }
}

export const userLogout = () => {
  return dispatch => {
    dispatch({
      type: 'START_LOADING'
    });
    RNKunafa.logout();
    RNKunafa.onLogout(() => {
      RNRestart.Restart();
    })
  }

}
