require('blob-polyfill');
window.atob = require('base-64').decode;
window.btoa = require('base-64').encode;
process.nextTick = setImmediate;

import createDocumentsActions from 'kunafa-client/actions/createDocumentsActions';

import Config from 'react-native-config';

const documentActions = createDocumentsActions(Config);

export default {
  ...documentActions
}
