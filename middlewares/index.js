import localCacheMiddleware from './local_cache_middleware';
import processLocalEventsMiddleware from './process_local_events_middleware';

export default [processLocalEventsMiddleware, localCacheMiddleware];
