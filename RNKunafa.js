import {
	DeviceEventEmitter,
	NativeModules
} from 'react-native';

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


export default RNKunafa;
