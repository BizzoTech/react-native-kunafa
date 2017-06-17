import RNKunafa from '../RNKunafa';

export const loadDocs = (query, overrideAction = {}) => dispatch => {
  return RNKunafa.publicDb.find(query).then(result => {
    return result.docs.map(doc => {
      return {
        ...doc,
        fetchedAt: Date.now()
      }
    })
  }).then(docs => {
    if (docs && docs.length > 0) {
      dispatch({
        type: 'LOAD_DOCS',
        docs,
        ...overrideAction
      });
    }
  }).catch(e => {
    console.log(e);
  });
}

const TTL = 5 * 60 * 1000; //5 minuts
//const TTL = 0; // Live Update

export const reLoadDoc = (doc, overrideAction = {}) => dispatch => {
  if (!doc || !doc._id) {
    return Promise.resolve();
  }
  if (!doc.invalidCache && doc.fetchedAt && (Date.now() - doc.fetchedAt < TTL)) {
    //console.log("loaded from cache");
    return Promise.resolve();
  }
  dispatch(loadDocs({
    selector: {
      _id: doc._id
    }
  }, overrideAction));
}
