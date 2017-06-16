import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    StatusBar,
		Linking,
    Dimensions
} from 'react-native';
import R from 'ramda';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';

import * as Progress from 'react-native-progress';

const {height, width} = Dimensions.get('window');

import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import actions from './actions';


const AppContainer = React.createClass({
		renderActivityIndicator(){
			const {processingLocal, appConfig, store} = this.props;
			const color = appConfig.progressBarColor(store) //'#E91E62' // theme.color1;
			if(processingLocal.isProcessing){
				return <Progress.Bar color={color} progress={processingLocal.progress} indeterminate={!processingLocal.progress} width={Dimensions.get('window').width} />;
			}
		},
    renderDialog(){
      const {dialog, closeDialog} = this.props;
      if(dialog.currentDialog){
        return (
          <PopupDialog height={dialog.height || height} onDismissed={closeDialog} show={true}
             ref={popup => {this.popup = popup}}
             dialogTitle={dialog.title ? <DialogTitle title={dialog.title} /> : undefined}
             dialogAnimation={dialog.animated ? new SlideAnimation({slideFrom: 'bottom', animationDuration:300}) : undefined}>
  					{this.renderDialogContent()}
  				</PopupDialog>
        )
      }
    },
    renderDialogContent(){
      const {dialog, closeDialog, appConfig} = this.props;
      return appConfig.renderDialogContent(dialog, closeDialog);
    },
    render(){
      const {Main, route, appConfig, store} = this.props;
			const color = appConfig.statusBarColor(store)// '#E2004C'; // theme.color17;
      return (
        <View style={{flex: 1}}>
         <StatusBar
           backgroundColor={color} animated={true}
         />
         <Main route={route} />
				 {this.renderActivityIndicator()}

				 {this.renderDialog()}
       </View>
      )
    }
});

export default connect(state => {
  	return {
      processingLocal: state.processing_local,
      route: state.history[0],
			dialog: state.dialog
    }
}, (dispatch) => {
    return bindActionCreators(actions, dispatch);
})(AppContainer);
