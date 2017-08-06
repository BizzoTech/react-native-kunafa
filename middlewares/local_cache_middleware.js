import {
  InteractionManager
} from 'react-native';
import SimpleStore from 'react-native-simple-store';
import R from 'ramda';

const removeOldDocs = async(cacheDocTypes, cacheLimit, keepInCache, state) => {
  const keys = await SimpleStore.keys();
  const items = await SimpleStore.get(keys);
  const docs = items.filter(item => item && cacheDocTypes.includes(item.type));
  const sortedDocs = R.sort((d1, d2) => d2.fetchedAt - d1.fetchedAt, docs.filter(d => !(keepInCache(d, state) || d._id === state.currentProfile._id)));
  if(sortedDocs.length > cacheLimit) {
    const toBeRemovedDocs = R.takeLast(sortedDocs.length - cacheLimit, sortedDocs);
    for(doc of toBeRemovedDocs) {
      await SimpleStore.delete(doc._id);
    }
  }
}

export default({
  cacheDocTypes,
  cacheLimit,
  keepInCache
}) => store => next => {
  setTimeout(async() => {
    const keys = await SimpleStore.keys();
    const items = await SimpleStore.get(keys);
    next({
      type: 'LOAD_DOCS_FROM_CACHE',
      docs: items.filter(item => item && cacheDocTypes.includes(item.type))
    });
  }, 200);

  return action => {
    let result = next(action);

    InteractionManager.runAfterInteractions(async() => {
      if(action.type === 'LOAD_DOCS') {
        for(doc of action.docs) {
          await SimpleStore.save(doc._id, doc);
        }
        if(action.docs.length > 1) {
          removeOldDocs(cacheDocTypes, cacheLimit, keepInCache, store.getState());
        }
      }
    });

    return result;
  }
}
