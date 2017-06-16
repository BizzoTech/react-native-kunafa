
export default (profileId) => {

  const defaultState = {
    _id: profileId
  }

  return (state = defaultState, action) => {
    switch (action.type) {
      case 'LOGIN':
        return {
          ...state,
          _id: action.profileId
        }
      default:
        return state;
    }
  }
}
