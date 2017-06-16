import R from 'ramda';

const defaultState = {};

export default (actionHandlers, getRelevantDocsIds) => {
  const actionHandlersKeys = R.flatten(Object.values(actionHandlers).map(hs => Object.keys(hs)));
  return (state = defaultState, action) => {
    switch (action.type) {
      case 'LOAD_DOCS':
      case 'LOAD_DOCS_FROM_CACHE':
        const modifiedDocs = action.docs.filter(doc => {
          return !state[doc._id] || state[doc._id]._rev !== doc._rev
        });
        return modifiedDocs.reduce((state, doc) => {
  				return R.merge(state, {[doc._id]: doc});//{...state, [doc._id]: doc};
  			}, state);
      default:
        if(actionHandlersKeys.includes(action.type)){
          const relevantDocsIds = getRelevantDocsIds(action);
          const relevantDocsToAdd = relevantDocsIds.filter(docId => {
    				return action.doc._id === docId && !action.doc._rev;
    			}).map(docId => {
    				return {type: action.doc.type}
    			});
          const relevantDocsToUpdate = relevantDocsIds.filter(docId =>{
            return action.doc._id !== docId || action.doc._rev;
          }).map(docId => state[docId]).filter(d => d);
          const relevantDocs = [
    				...relevantDocsToAdd,
    				...relevantDocsToUpdate
    			];
          const updatedDocs = relevantDocs.map(doc => actionHandlers[doc.type][action.type](doc, action)).filter(doc => !relevantDocs.includes(doc));
          if(updatedDocs.length > 0){
            return updatedDocs.reduce((state, doc) => {
      				return R.merge(state, {[doc._id]: doc});//{...state, [doc._id]: doc};
      			}, state);
          } else {
            return state;
          }
        }else{
          return state;
        }
    }
  }
}
