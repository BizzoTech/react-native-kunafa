require('blob-polyfill');
window.atob = require('base-64').decode;
window.btoa = require('base-64').encode;
process.nextTick = setImmediate;

import RNKunafa from './RNKunafa';
import createApp from './createApp';
import { connect } from 'kunafa-client';

import FBLogin from './components/FBLogin';

export default RNKunafa;
export { createApp, FBLogin, connect };