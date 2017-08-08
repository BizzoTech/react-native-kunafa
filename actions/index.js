require('blob-polyfill');
window.atob = require('base-64').decode;
window.btoa = require('base-64').encode;
process.nextTick = setImmediate;

import kunafaActions from 'kunafa-client/actions';

import * as authActions from './auth';
//import documentsActions from './documents';
import Config from 'react-native-config';

export default {
  ...kunafaActions(Config),
  ...authActions,
  //...documentsActions
}
