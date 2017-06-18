import R from 'ramda';

const defaultState = {};

export default function(state = defaultState, action) {
  switch (action.type) {
		case 'LOAD_EVENTS':
      return R.merge(state, R.indexBy(R.prop('_id'), action.events));
    case 'ADD_EVENT':
    case 'UPDATE_EVENT':
      return R.assoc(action.doc._id, action.doc, state);
    case 'REMOVE_EVENT':
      return R.dissoc(action.doc._id, state);
    case 'LOGIN':
    case 'LOGOUT':
      return defaultState;
    default:
      return state;
  }
}
