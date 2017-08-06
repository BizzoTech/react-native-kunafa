export default ({getNotificationRoute}) => store => next => action => {
  if (action.type === types.CLICK_NOTIFICATION) {
		if(action.notification && action.notification.actionType){
			const notification = action.notification;
			const actionType =  notification.actionType;
      const route = getNotificationRoute(notification);
      if(route){
        next({
          type: action.external ? types.GO_TO : types.NAVIGATE_TO,
          route
        });
      }
		}
  }
	return next(action);
}
