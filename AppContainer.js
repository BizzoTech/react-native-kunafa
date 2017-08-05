import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Linking,
  DeviceEventEmitter,
  Dimensions
} from 'react-native';
import R from 'ramda';
import PopupDialog, {DialogTitle, SlideAnimation} from 'react-native-popup-dialog';

import * as Progress from 'react-native-progress';

const {height, width} = Dimensions.get('window');

import connect from './connect';

import RNKunafa from './RNKunafa';

class AppContainer extends Component {
  constructor(props){
    super(props);
    this.state = {
      splash: true
    }
  }
  componentDidMount = () => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        this._handleOpenURL({url});
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
      })
    }, 500);

    setTimeout(() => {
      this.setState({splash: false});
    }, 600);
  }
  componentWillUnmount = () => {
    Linking.removeEventListener('url', this._handleOpenURL);
  }
  _handleClickNotification = docId => {
    const {notifications, clickExternalNotification} = this.props;
    clickExternalNotification(notifications[docId].notification || {});
  }
  _handleOpenURL = ({url}) => {
    const route = RNKunafa.appConfig.getDeepLinkRoute(url);
    this.props.navigateTo(route.name, route.params);
  }
  renderActivityIndicator = () => {
    const {processingLocal} = this.props;
    const color = RNKunafa.appConfig.progressBarColor(RNKunafa.AppStore.getState);
    if (processingLocal.isProcessing) {
      return <Progress.Bar color={color} progress={processingLocal.progress} indeterminate={!processingLocal.progress} width={Dimensions.get('window').width}/>;
    }
  }
  renderDialog = () => {
    const {dialog, closeDialog} = this.props;
    if (dialog.currentDialog) {
      return (
        <PopupDialog height={dialog.height || height} onDismissed={closeDialog} show={true} ref={popup => {
          this.popup = popup
        }} dialogTitle={dialog.title
          ? <DialogTitle title={dialog.title}/>
          : undefined} dialogAnimation={dialog.animated
          ? new SlideAnimation({slideFrom: 'bottom', animationDuration: 300})
          : undefined}>
          {this.renderDialogContent()}
        </PopupDialog>
      )
    }
  }
  renderDialogContent = () => {
    const {dialog, closeDialog} = this.props;
    return RNKunafa.appConfig.renderDialogContent(dialog, closeDialog);
  }
  render = () => {
    const {Main, route} = this.props;
    const color = RNKunafa.appConfig.statusBarColor(RNKunafa.AppStore.getState);
    if (this.state.splash) {
      return (
        <View>
          <StatusBar backgroundColor={color} animated={true}/>
        </View>
      );
    }
    return (
      <View style={{
        flex: 1,
        backgroundColor: "white"
      }}>
        <StatusBar backgroundColor={color} animated={true}/>
        <Main route={route}/>
        {this.renderActivityIndicator()}
        {this.renderDialog()}
      </View>
    )
  }
}

export default connect(state => {
  return {processingLocal: state.processing_local, route: state.history[0], dialog: state.dialog, notifications: state.notifications}
})(AppContainer);
