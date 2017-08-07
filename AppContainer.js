import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Linking,
  DeviceEventEmitter,
  Dimensions,
  BackHandler,
  NetInfo
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
    BackHandler.addEventListener('hardwareBackPress', () => {
      if(this.props.history.length > 1) {
        this.props.goBack();
        return true;
      }
      return false;
    });

    setInterval(async() => {
      const {events, processingLocal, processLocalOnly} = this.props;
      const hasLocalEvents = R.values(events).some(R.prop('localOnly'));
      const isProcessing = processingLocal.isProcessing;
      const isConnected = await NetInfo.isConnected.fetch();
      if(hasLocalEvents && !isProcessing && isConnected) {
        processLocalOnly();
      }
    }, 1000);

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
    const {Main, history} = this.props;
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
        <Main route={history[0]}/>
        {this.renderActivityIndicator()}
        {this.renderDialog()}
      </View>
    )
  }
}

export default connect(state => {
  return {
    events: state.events,
    processingLocal: state.processing_local,
    history: state.history,
    dialog: state.dialog,
    notifications: state.notifications
  }
}, dispatch => {
  return {
    processLocalOnly: () => {
      dispatch({
        type: 'PROCESS_LOCAL_ONLY'
      });
    }
  }
})(AppContainer);
