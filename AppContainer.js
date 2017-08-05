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
  componentDidMount = () => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        RNKunafa.appConfig.handleDeepLink(url, RNKunafa.AppStore);
      }
    }).catch(err => console.error('An error occurred', err));
    Linking.addEventListener('url', this._handleOpenURL);

    DeviceEventEmitter.addListener("NotificationClick", docId => {
      if (docId) {
        RNKunafa.appConfig.handleNotificationClick(docId, RNKunafa.AppStore);
      }
    });
    setTimeout(() => {
      RNKunafa.getInitialNotificationClickDocId(docId => {
        if (docId) {
          RNKunafa.appConfig.handleNotificationClick(docId, RNKunafa.AppStore);
        }
      })
    }, 500);
  }
  componentWillUnmount = () => {
    Linking.removeEventListener('url', this._handleOpenURL);
  }
  _handleOpenURL = (event) => {
    RNKunafa.appConfig.handleDeepLink(event.url, RNKunafa.AppStore);
  }
  renderActivityIndicator = () => {
    const {processingLocal} = this.props;
    const color = RNKunafa.appConfig.progressBarColor(RNKunafa.AppStore);
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
    const color = RNKunafa.appConfig.statusBarColor(RNKunafa.AppStore)
    return (
      <View style={{
        flex: 1
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
  return {processingLocal: state.processing_local, route: state.history[0], dialog: state.dialog}
})(AppContainer);
