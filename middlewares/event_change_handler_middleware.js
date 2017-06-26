import R from 'ramda';

import {reLoadDoc} from '../actions/documents';

export default store => next => action => {

 let result = next(action);

 if (action.type === 'LOAD_EVENTS') {
  for (event of action.events) {
   if (event.relevantDocsIds && event.relevantDocsIds.length > 0) {
    next(event.action);
   }
  }
 }

 if (action.type === 'UPDATE_EVENT' || action.type === "ADD_EVENT") {
  if (!action.doc.draft && action.doc.appliedOn) {
   for (docId of Object.keys(action.doc.appliedOn)) {
    store.dispatch(reLoadDoc({_id: docId}));
   }
  }
 }

 return result;

}
