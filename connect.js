import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import actions from './actions';

export default(mapStateToProps, mapDispatchToProps) => component => {
 return connect(mapStateToProps, (dispatch) => {
  const pkgActions = bindActionCreators(actions, dispatch);
  if(mapDispatchToProps){
    const userActions = mapDispatchToProps(dispatch);
    return {...pkgActions, userActions};
  }
  return pkgActions;
 })(component);
}
