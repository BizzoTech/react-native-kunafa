import R from 'ramda';
import Config from 'react-native-config';
import {
	DeviceEventEmitter,
	NativeModules
} from 'react-native';
const RNKunafa = NativeModules.RNKunafa;

import createSyncMiddleware from './sync_middleware';
import createEventSourcingMiddleware from './event_sourcing_middleware';
import createLocalCacheMiddleware from './local_cache_middleware';
import createProcessLocalEventsMiddleware from './process_local_events_middleware';

import eventChangeHandlerMiddleware from './event_change_handler_middleware';

export default config => {
  const localUsername = Config.LOCAL_USERNAME || "kunafa";
  const localPassword = Config.LOCAL_PASSWORD || "kunafa";
  const localListnerUrl = `http://${localUsername}:${localPassword}@127.0.0.1:${config.port}/`;

  const syncMiddleware = createSyncMiddleware(localListnerUrl, R.append({
    name: "events",
    filter: function(doc) {
      return doc.type == "EVENT"; // & !doc.appliedOnClient;
    },
    actions: {
      remove: 'REMOVE_EVENT',
      update: 'UPDATE_EVENT',
      insert: 'ADD_EVENT',
      load: 'LOAD_EVENTS'
    }
  }, config.syncPaths || []));

  const eventSourcingMiddleware = createEventSourcingMiddleware(config);

  const localCacheMiddleware = createLocalCacheMiddleware(config);

  const processLocalEventsMiddleware = createProcessLocalEventsMiddleware(config);

  return [processLocalEventsMiddleware, localCacheMiddleware, eventSourcingMiddleware, syncMiddleware, eventChangeHandlerMiddleware];
}
