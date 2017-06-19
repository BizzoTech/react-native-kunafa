import R from 'ramda';

const defaultState = {}

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'CREATE_DOCS_LOADER':
      return {
        ...state,
        [action.loaderName] : {
          query: action.query,
          loaded: 0,
          endReached: false
        }
      }
    case 'REMOVE_DOCS_LOADER':
      return R.dissoc(action.loaderName, state);
    case 'LOAD_DOCS':
      if(!action.loaderName || !state[action.loaderName]){
        return state;
      }
      const loader = state[action.loaderName];
      return {
        ...state,
        [action.loaderName] : {
          ...loader,
          loaded: loader.loaded + action.docs.length,
          endReached: action.docs.length < (loader.query.limit || 25)
        }
      }
    case 'REFRESH_LOADER':
      if(!action.loaderName || !state[action.loaderName]){
        return state;
      }
      return {
        ...state,
        [action.loaderName] : {
          ...(state[action.loaderName]),
          loaded: 0,
          endReached: false
        }
      }
    default:
      return state;
  }
}
