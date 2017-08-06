export default({
  getNotificationRoute
}) => store => next => action => {
  if(action.type === 'CLICK_NOTIFICATION') {
    if(action.notification && action.notification.actionType) {
      const notification = action.notification;
      const actionType = notification.actionType;
      const route = getNotificationRoute(notification);
      if(route) {
        next({
          type: action.external ?
            'GO_TO' :
            'NAVIGATE_TO',
          route
        });
      }
    }
  }
  return next(action);
}
