import syncMiddleware from './sync_middleware';
import eventSourcingMiddleware from './event_sourcing_middleware';
import localCacheMiddleware from './local_cache_middleware';
import processLocalEventsMiddleware from './process_local_events_middleware';

import eventChangeHandlerMiddleware from './event_change_handler_middleware';

export default [processLocalEventsMiddleware, localCacheMiddleware, eventSourcingMiddleware, syncMiddleware, eventChangeHandlerMiddleware];
