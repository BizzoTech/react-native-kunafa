import Promise from 'bluebird';
import {
  InteractionManager,
  NetInfo
} from 'react-native';

import R from 'ramda';

export default(store, {
  processLocalEvent
}) => next => action => {
  if(action.type === 'PROCESS_LOCAL_ONLY') {
    NetInfo.isConnected.fetch().then(isConnected => {
      //console.log('First, is ' + (isConnected ? 'online' : 'offline'));
      if(isConnected) {
        const localOnlyEvents = R.sort((a1, a2) => a1.createdAt - a2.createdAt, R.values(store.getState().events).filter(R.prop('localOnly')))
        if(localOnlyEvents.length < 1) {
          return
        }
        next({
          type: 'START_PROCESSING_LOCAL'
        });
        //console.log(localOnlyEvents);
        Promise.each(localOnlyEvents, (event, index, length) => {
          return processLocalEvent(event, progress => {
            next({
              type: 'START_PROCESSING_LOCAL',
              progress
            });
          }).then(event => {
            InteractionManager.runAfterInteractions(() => {
              next({
                type: 'UPDATE_EVENT',
                doc: {
                  ...event,
                  draft: "true",
                  localOnly: undefined
                }
              });
            });
          });
        }).catch(console.log).finally(() => {
          next({
            type: 'END_PROCESSING_LOCAL'
          });
        });
      }
    });
  } else {
    return next(action);
  }
}
