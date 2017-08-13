import React, { Component } from 'react';
import { StyleSheet, Text, View, StatusBar, Linking, DeviceEventEmitter, Dimensions, BackHandler } from 'react-native';
import R from 'ramda';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';

import * as Progress from 'react-native-progress';

const { height, width } = Dimensions.get('window');

import { connect } from 'kunafa-client';

import RNKunafa from './RNKunafa';

class AppContainer extends Component {
  constructor(props) {
    super(props);

    this.componentDidMount = () => {
      BackHandler.addEventListener('hardwareBackPress', () => {
        if (this.props.history.length > 1) {
          this.props.goBack();
          return true;
        }
        return false;
      });

      Linking.getInitialURL().then(url => {
        if (url) {
          this._handleOpenURL({ url });
        }
      }).catch(err => console.error('An error occurred', err));
      Linking.addEventListener('url', this._handleOpenURL);

      DeviceEventEmitter.addListener("NotificationClick", docId => {
        if (docId) {
          this._handleClickNotification(docId);
        }
      });
      setTimeout(() => {
        RNKunafa.getInitialNotificationClickDocId(docId => {
          if (docId) {
            this._handleClickNotification(docId);
          }
        });
      }, 500);

      setTimeout(() => {
        this.setState({ splash: false });
      }, 600);
    };

    this.componentWillUnmount = () => {
      Linking.removeEventListener('url', this._handleOpenURL);
    };

    this._handleClickNotification = docId => {
      const { notifications, clickExternalNotification } = this.props;
      clickExternalNotification(notifications[docId].notification || {});
    };

    this._handleOpenURL = ({ url }) => {
      const route = RNKunafa.appConfig.getDeepLinkRoute(url);
      this.props.navigateTo(route.name, route.params);
    };

    this.renderActivityIndicator = () => {
      const { processingLocal } = this.props;
      const color = RNKunafa.appConfig.progressBarColor(RNKunafa.AppStore.getState);
      if (processingLocal.isProcessing) {
        return React.createElement(Progress.Bar, { color: color, progress: processingLocal.progress, indeterminate: !processingLocal.progress, width: Dimensions.get('window').width });
      }
    };

    this.renderDialog = () => {
      const { dialog, closeDialog } = this.props;
      if (dialog.currentDialog) {
        return React.createElement(
          PopupDialog,
          { height: dialog.height || height, onDismissed: closeDialog, show: true, ref: popup => {
              this.popup = popup;
            }, dialogTitle: dialog.title ? React.createElement(DialogTitle, { title: dialog.title }) : undefined, dialogAnimation: false ? new SlideAnimation({ slideFrom: 'bottom', animationDuration: 300 }) : undefined },
          this.renderDialogContent()
        );
      }
    };

    this.renderDialogContent = () => {
      const { dialog, closeDialog } = this.props;
      return RNKunafa.appConfig.renderDialogContent(dialog, closeDialog);
    };

    this.render = () => {
      const { Main, history } = this.props;
      const color = RNKunafa.appConfig.statusBarColor(RNKunafa.AppStore.getState);
      if (this.state.splash) {
        return React.createElement(
          View,
          null,
          React.createElement(StatusBar, { backgroundColor: color, animated: true })
        );
      }
      return React.createElement(
        View,
        { style: {
            flex: 1,
            backgroundColor: "white"
          } },
        React.createElement(StatusBar, { backgroundColor: color, animated: true }),
        React.createElement(Main, { route: history[0] }),
        this.renderActivityIndicator(),
        this.renderDialog()
      );
    };

    this.state = {
      splash: true
    };
  }
}

export default connect(state => {
  return {
    events: state.events,
    processingLocal: state.processing_local,
    history: state.history,
    dialog: state.dialog,
    notifications: state.notifications
  };
}, dispatch => {
  return {
    processLocalOnly: () => {
      dispatch({
        type: 'PROCESS_LOCAL_ONLY'
      });
    }
  };
})(AppContainer);