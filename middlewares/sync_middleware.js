import R from 'ramda';
import {
	InteractionManager
} from 'react-native';

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

export default (db, paths) => store => next => {
  //Initial Load docs to improve render performance by tracking new changes only
  db.allDocs({
    include_docs: true
  }).then(result => {
    paths.forEach(path => {
      if (path.actions.load) {
        next({
          type: path.actions.load,
          [path.name]: result.rows.map(r => r.doc).filter(path.filter)
        })
      }
    })

  })

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
					next({
	          type: getDefaultAction(path.actions.remove),
	          doc: change.doc
	        });
				});
        return;
      }
      const pathState = store.getState()[path.name];
      if (pathState[change.doc._id]) {
          InteractionManager.runAfterInteractions(() => {
            next({
              type: getDefaultAction(path.actions.update),
              doc: change.doc
            });
          });
        return;
      } else {
        InteractionManager.runAfterInteractions(() => {
          next({
            type: getDefaultAction(path.actions.insert),
            doc: change.doc
          });
        });
        return;
      }

    });
  });

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
		}
  }
}
