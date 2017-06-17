import {
	DeviceEventEmitter,
	NativeModules
} from 'react-native';

import PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-find'));

const RNKunafa = NativeModules.RNKunafa;

RNKunafa.onListnerStarted = cb => {
	const startListnerHandler = DeviceEventEmitter.addListener("LISTNETR_STARTED", port => {
		cb(port);
		startListnerHandler.remove();
	});
}

RNKunafa.onLogin = cb => {
	const startLoginHandler = DeviceEventEmitter.addListener("LOGGED_IN", loggedIn => {
		if (loggedIn === "true") {
			cb();
			startLoginHandler.remove();
		}
	});
}

RNKunafa.onLogout = cb => {
	const startLogoutHandler = DeviceEventEmitter.addListener("LOGGED_IN", loggedIn => {
		if (loggedIn !== "true") {
			cb();
			startLogoutHandler.remove();
		}
	});
}

RNKunafa.init = (host, localUserName, localPassword) => {
  RNKunafa.publicDb = new PouchDB(`http://${host}/public`, {
		ajax: {
			timeout: 60000
		}
	});
  return NativeModules.RNKunafa.init(host, localUserName, localPassword);
}

export default RNKunafa;
