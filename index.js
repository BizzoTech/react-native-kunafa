require('blob-polyfill');
window.atob = require('base-64').decode;
window.btoa = require('base-64').encode;
process.nextTick = setImmediate;

import RNKunafa from './RNKunafa';
import createApp from './createApp';
import actions from './actions';
import connect from 'kunafa-client/connect';

import FBLogin from './components/FBLogin';

export default RNKunafa;
export {createApp, actions, FBLogin, connect};
