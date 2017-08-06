import {
  connect
} from 'react-redux';
import {
  bindActionCreators
} from 'redux';

import RNKunafa from './RNKunafa';

export default(mapStateToProps, mapDispatchToProps) => component => {
  return connect(mapStateToProps, (dispatch) => {
    if(mapDispatchToProps) {
      const userActions = mapDispatchToProps(dispatch);
      return {
        ...(bindActionCreators(RNKunafa.actions, dispatch)),
        ...userActions
      };
    }
    return bindActionCreators(RNKunafa.actions, dispatch);
  })(component);
}
