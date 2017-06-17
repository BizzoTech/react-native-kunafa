import R from 'ramda';

export default (profileId) => {

  const startWithMenu = [{
    name: 'HOME'
  }];
  const startWithLogin = [{
    name: 'LOGIN'
  }];

  const defaultState = profileId ? startWithMenu : startWithLogin;

  return (state = defaultState, action) => {
    switch (action.type) {
      case 'RESET_HISTORY':
        return defaultState;
      case 'GO_TO':
        return [action.route, ...startWithMenu];
      case 'NAVIGATE_TO':
        return [action.route, ...state];
      case 'START_LOADING':
        return [{
          name: 'LOADING'
        }, ...state];
      case 'TRANSITE_TO':
        return state.length > 1 ? R.update(0, action.route, state) : [action.route, ...state];
      case 'GO_BACK':
        if (state.length > 1) {
          const currentRoute = state[0];
          const newRoute = state[1];
          return R.update(0, {...newRoute,
            backFrom: currentRoute
          }, R.tail(state));
        }
        return state;
      case 'SKIP_LOGIN':
      case 'LOGIN':
        return startWithMenu;
      case 'LOGOUT':
        return startWithLogin;
      default:
        return state
    }
  }
}
