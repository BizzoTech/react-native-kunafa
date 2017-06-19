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


export const createDocLoader = (loaderName, query) => {
  return {
    type: 'CREATE_DOCS_LOADER',
    loaderName,
    query
  }
}

export const loadMoreDocs = loaderName => (dispatch, getState) => {
  const loaderState = getState().docLoaders[loaderName];
  if (loaderState) {
    const {
      query,
      loaded,
      endReached
    } = loaderState;
    if (endReached) {
      return;
    }

    dispatch(loadDocs({ ...query,
      skip: loaded > 0 ? loaded : undefined
    }, {
      loaderName
    }));
  }
}

export const refreshLoader = loaderName => dispatch => {
  dispatch({
    type: 'REFRESH_LOADER',
    loaderName
  });
  dispatch(loadMoreDocs(loaderName));
}
