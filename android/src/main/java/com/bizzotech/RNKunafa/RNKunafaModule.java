package com.bizzotech.RNKunafa;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.facebook.react.bridge.*;

import android.content.SharedPreferences;
import android.os.Bundle;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.widget.Toast;


public class RNKunafaModule extends ReactContextBaseJavaModule implements LifecycleEventListener {

    ReactApplicationContext reactContext;

    public RNKunafaModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        reactContext.addLifecycleEventListener(this);


    }

    @Override
    public String getName() {
        return "RNKunafa";
    }

    @ReactMethod
    public void init(String host, String localUsername, String localPassword) {
      SharedPreferences sharedpreferences = reactContext.getSharedPreferences("RNKunafa", Context.MODE_PRIVATE);
      SharedPreferences.Editor editor = sharedpreferences.edit();
      editor.putString("host", host);
      editor.putString("localUsername", localUsername);
      editor.putString("localPassword", localPassword);
      editor.commit();
    }

    @ReactMethod
    public void login(String username, String password, String profileId) {
      SharedPreferences sharedpreferences = reactContext.getSharedPreferences("RNKunafa", Context.MODE_PRIVATE);
      SharedPreferences.Editor editor = sharedpreferences.edit();
      editor.putString("loggedIn", "true");
      editor.putString("username", username);
      editor.putString("password", password);
      editor.putString("profileId", profileId);
      editor.commit();
    }

    @ReactMethod
    public void logout() {
      SharedPreferences sharedpreferences = reactContext.getSharedPreferences("RNKunafa", Context.MODE_PRIVATE);
      SharedPreferences.Editor editor = sharedpreferences.edit();
      editor.putString("loggedIn", "false");
      editor.remove("username");
      editor.remove("password");
      editor.remove("profileId");
      editor.commit();
    }

    @ReactMethod
    public void getProfileId(Callback cb) {
      SharedPreferences sharedpreferences = reactContext.getSharedPreferences("RNKunafa", Context.MODE_PRIVATE);
      cb.invoke(sharedpreferences.getString("profileId", null));
    }

    @ReactMethod
    public void getInitialNotificationClickDocId(Callback cb) {
      Bundle bundle = getCurrentActivity().getIntent().getExtras();
      if(bundle != null && bundle.getString("_id")!= null) {
        cb.invoke(bundle.getString("_id"));
      }else{
        cb.invoke();
      }
    }

    @Override
    public void onHostResume() {
        // Activity `onResume`
        StaticValues.IN_BACKGROUND = false;
        Bundle bundle = getCurrentActivity().getIntent().getExtras();
        if(bundle != null && bundle.getString("_id")!= null) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
             .emit("NotificationClick", bundle.getString("_id"));
         }
         if(bundle != null && bundle.getString("notifications")!= null) {
             reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
              .emit("NotificationClick", null);
          }
    }

    @Override
    public void onHostPause() {
        // Activity `onPause`
        StaticValues.IN_BACKGROUND = true;
    }

    @Override
    public void onHostDestroy() {
        // Activity `onDestroy`
    }


}
