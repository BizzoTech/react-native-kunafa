import R from 'ramda';
import PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-find'));

import createSyncMiddleware from './sync_middleware';
import createEventSourcingMiddleware from './event_sourcing_middleware';
import createLocalCacheMiddleware from './local_cache_middleware';
import createProcessLocalEventsMiddleware from './process_local_events_middleware';

export default config => {
  const localUsername = config.localUsername || "kunafa";
  const localPassword = config.localPassword || "kunafa";
  const dbName = config.profileId || "anonymous";
  const localDbUrl = `http://${localUsername}:${localPassword}@127.0.0.1:${config.port}/${dbName}`;
	const localDb = new PouchDB(localDbUrl, {
		ajax: {
			timeout: 60000
		}
	});

	const syncMiddleware = createSyncMiddleware(localDb, R.append({
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

	const eventSourcingMiddleware = createEventSourcingMiddleware(config.localOnlyActions, config.needLocalProcessing, config.getActionPreProcessors, config.getActionPostProcessors, config.getRelevantDocsIds)

	const localCacheMiddleware = createLocalCacheMiddleware(config.cacheDocTypes, config.cacheLimit, config.keepInCache);

	const processLocalEventsMiddleware = createProcessLocalEventsMiddleware(config.processLocalEvent);

	return [processLocalEventsMiddleware, localCacheMiddleware, eventSourcingMiddleware, syncMiddleware];
}
