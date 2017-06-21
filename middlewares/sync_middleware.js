import R from 'ramda';
import {
	InteractionManager
} from 'react-native';
import PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-find'));
import Config from 'react-native-config';

const getDefaultAction = act => {
  let action = act;
  if (Array.isArray(action)) {
    action = action[0];
  }
  if (typeof action === 'string') {
    return action;
  } else {
    return action.type;
  }
}

const initialLoad = async(db, paths, dispatch) => {
  const result = await db.allDocs({
    include_docs: true
  });
  paths.forEach(path => {
    if (path.actions.load) {
      dispatch({
        type: path.actions.load,
        [path.name]: result.rows.map(r => r.doc).filter(path.filter)
      })
    }
  })
}

const syncChanges = (db, paths, store, dispatch) => {
  const changes = db.changes({
    since: 'now',
    live: true,
    include_docs: true
  });
  changes.on('change', change => {
    paths.forEach((path) => {
      if (path.filter && !(path.filter(change.doc))) {
        return;
      }
      //console.log(change)
      if (change.doc._deleted) {
				InteractionManager.runAfterInteractions(() => {
					dispatch({
	          type: getDefaultAction(path.actions.remove),
	          doc: change.doc
	        });
				});
        return;
      }
      const pathState = store.getState()[path.name];
      if (pathState[change.doc._id]) {
          InteractionManager.runAfterInteractions(() => {
            dispatch({
              type: getDefaultAction(path.actions.update),
              doc: change.doc
            });
          });
        return;
      } else {
        InteractionManager.runAfterInteractions(() => {
          dispatch({
            type: getDefaultAction(path.actions.insert),
            doc: change.doc
          });
        });
        return;
      }

    });
  });
  return changes;
}

export default (localListnerUrl, paths) => store => next => {

  const dbName = store.getState().currentProfile._id || "anonymous";
  const localDbUrl = localListnerUrl + dbName + "-" + Config.BUILD_TYPE;
	let db = new PouchDB(localDbUrl, {
		ajax: {
			timeout: 60000
		}
	});
  //Initial Load docs to improve render performance by tracking new changes only
  initialLoad(db, paths, next);

  let changes = syncChanges(db, paths, store, next);

  const getDocs = (state, action) => [action.doc];
  const mergedActions = {
    insert: [],
    update: [],
    remove: []
  };
  const mergeAction = actName => action => {
    if (typeof action === 'string') {
      mergedActions[actName].push({
        type: action,
        getDocs
      });
    }
    if (typeof action === 'object') {
      mergedActions[actName].push({
        type: action.type,
        getDocs: action.getDocs || getDocs
      });
    }
  }
  paths.forEach(path => {
    if (Array.isArray(path.actions.insert)) {
      path.actions.insert.forEach(mergeAction("insert"));
    } else {
      mergeAction("insert")(path.actions.insert);
    }

    if (Array.isArray(path.actions.update)) {
      path.actions.update.forEach(mergeAction("update"));
    } else {
      mergeAction("update")(path.actions.update);
    }

    if (Array.isArray(path.actions.remove)) {
      path.actions.remove.forEach(mergeAction("remove"));
    } else {
      mergeAction("remove")(path.actions.remove);
    }
  })

  return action => {
    const bulk = [];
    const state = store.getState();
    mergedActions.insert.forEach(insertAction => {
      if (insertAction.type === action.type) {
        const docs = insertAction.getDocs(state, action);
        docs.forEach(doc => {
          if (doc.draft) {
            //db.put(R.omit(['draft'], doc));
            bulk.push(R.omit(['draft'], doc));
          }
        })
      }
    });
    mergedActions.update.forEach(updateAction => {
      if (updateAction.type === action.type) {
        const docs = updateAction.getDocs(state, action);
        docs.forEach(doc => {
          if (doc.draft) {
            //db.put(R.omit(['draft'], doc));
            bulk.push(R.omit(['draft'], doc));
          }
        })
      }
    });
    mergedActions.remove.forEach(removeAction => {
      if (removeAction.type === action.type) {
        const docs = removeAction.getDocs(state, action);
        docs.forEach(doc => {
          //db.remove(doc)
          bulk.push(R.merge(doc, {_deleted: true}));
        })
				next(action);
      }
    });

		if(bulk.length){
			InteractionManager.runAfterInteractions(() => {
				db.bulkDocs(bulk);
			});
		} else{
			next(action);

      if(action.type === 'LOGIN' || action.type === 'LOGOUT'){
        changes.cancel();
        const dbName = store.getState().currentProfile._id || "anonymous";
        const localDbUrl = localListnerUrl + dbName + "-" + Config.BUILD_TYPE;
      	db = new PouchDB(localDbUrl, {
      		ajax: {
      			timeout: 60000
      		}
      	});
        //Initial Load docs to improve render performance by tracking new changes only
        initialLoad(db, paths, next);

        changes = syncChanges(db, paths, store, next);
      }
		}
  }
}
