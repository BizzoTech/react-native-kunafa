package com.bizzotech.RNKunafa;

import android.app.IntentService;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.content.Context;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableNativeArray;


import com.couchbase.lite.listener.LiteListener;
import com.couchbase.lite.listener.Credentials;
import com.couchbase.lite.Manager;
import com.couchbase.lite.Database;
import com.couchbase.lite.DocumentChange;
import com.couchbase.lite.Document;
import com.couchbase.lite.replicator.Replication;
import com.couchbase.lite.ReplicationFilter;
import com.couchbase.lite.SavedRevision;
import com.couchbase.lite.auth.Authenticator;
import com.couchbase.lite.auth.AuthenticatorFactory;

import com.couchbase.lite.android.AndroidContext;
import com.couchbase.lite.util.Log;

import android.widget.Toast;

import java.io.IOException;
import java.net.URL;
//import java.net.Authenticator;

import com.couchbase.lite.CouchbaseLiteException;


import java.util.*;
import com.couchbase.lite.*;
//import java.util.HashMap;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.content.SharedPreferences;

import com.bizzotech.RNKunafa.StaticValues;


public class NotificationService extends IntentService{
    String host;
    String localUsername;
    String localPassword;

    Manager manager;
    LiteListener liteListener;
		int port;
    Database db;
    Replication push;
    Replication pull;
    String dbName; // null || "anonymous" || profileId
    String username;
		String password;
		String syncingWith; // null || "anonymous" || profileId
    String dbUrl;

    Database sharedDb;
    Replication sharedDbPull;

    public NotificationService() {
       this(NotificationService.class.getName());

    }


    /**
     * Creates an IntentService.  Invoked by your subclass's constructor.
     *
     * @param name Used to name the worker thread, important only for debugging.
     */
    public NotificationService(String name) {
        super(name);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);
        // We want this service to continue running until it is explicitly
        // stopped, so return sticky.
        return START_STICKY;
    }
    private void startCBLite(){
			try{
					manager = new Manager(new AndroidContext(this), Manager.DEFAULT_OPTIONS);
					liteListener = new LiteListener(manager, 1024, new Credentials(localUsername, localPassword));
					liteListener.start();
					port = liteListener.getListenPort();

          sharedDb = manager.getDatabase("shared");
          URL sharedDbUrl =  new URL("http://" + host + "/shared");
          sharedDbPull = sharedDb.createPullReplication(sharedDbUrl);
          sharedDbPull.setContinuous(true);
          sharedDbPull.start();

          sharedDb.addChangeListener(new Database.ChangeListener() {
           public void changed(Database.ChangeEvent event) {
             if(event.isExternal()){
                 for (DocumentChange ch : event.getChanges()) {
                   onDocumentChange(ch, sharedDb);
                 }
             }
           }
         });

			} catch (IOException e) {
					Log.e("RNKunafa", "Cannot create Manager instance", e);
					return;
			} catch(CouchbaseLiteException e){
          Log.e("RNKunafa", "Cannot open database", e);
          return;
      }
		}
		private void startSyncing(){
      try{
          db = manager.getDatabase(dbName);
          db.setFilter("notLocal", new ReplicationFilter() {
              @Override
              public boolean filter(SavedRevision revision, Map<String, Object> params) {
                  String localOnly = "true";
                  return !localOnly.equals(revision.getProperty("localOnly"));
              }
          });
          db.addChangeListener(new Database.ChangeListener() {
           public void changed(Database.ChangeEvent event) {
             if(event.isExternal()){
                 for (DocumentChange ch : event.getChanges()) {
                   onDocumentChange(ch, db);
                 }
             }
           }
         });
          URL url =  new URL(dbUrl);
          Authenticator auth = AuthenticatorFactory.createBasicAuthenticator(username, password);
          push = db.createPushReplication(url);
          push.setContinuous(true);
          push.setFilter("notLocal");
          pull = db.createPullReplication(url);
          pull.setContinuous(true);

          if(!dbName.equals("anonymous")){
            push.setAuthenticator(auth);
            pull.setAuthenticator(auth);
            pull.start();
          }
          push.start();

          syncingWith = dbName;
      } catch(IOException e){
          Log.e("RNKunafa", "Bad URL", e);
          return;
      } catch(CouchbaseLiteException e){
          Log.e("RNKunafa", "Cannot open database", e);
          return;
      }
		}

		private void stopSyncing(){
			if(push != null){
				push.stop();
				push = null;
			}
			if(pull != null){
				pull.stop();
				pull = null;
			}
		}

   protected void onDocumentChange(DocumentChange ch, Database db){

   }

  @Override
  protected void onHandleIntent(Intent intent) {
      final Context cont = this;
      try{
          Thread.sleep(1000);
      }catch(InterruptedException e){

      }
      while(true){
          SharedPreferences sharedpreferences = cont.getSharedPreferences("RNKunafa", Context.MODE_PRIVATE);
          host = sharedpreferences.getString("host", null);
          localUsername = sharedpreferences.getString("localUsername", "kunafa");
          localPassword = sharedpreferences.getString("localPassword", "kunafa");
          if(host == null || !host.equals(sharedpreferences.getString("host", null))){
            try{
                Thread.sleep(100);
            }catch(InterruptedException e){

            }
            continue;
          }
          if(localUsername == null || !localUsername.equals(sharedpreferences.getString("localUsername", null))){
            continue;
          }
          if(localPassword == null || !localPassword.equals(sharedpreferences.getString("localPassword", null))){
            continue;
          }

          if(liteListener == null){
            startCBLite();
          }

          try{
              Thread.sleep(1000);
          }catch(InterruptedException e){

          }

          if(sharedpreferences.getString("loggedIn", "false").equals("true")){
            dbUrl = "http://" + host + "/db";
          } else {
            dbUrl = "http://" + host+ "/anonymous";
          }
          username = sharedpreferences.getString("username", "");
          password = sharedpreferences.getString("password", "");
          dbName = sharedpreferences.getString("profileId", "anonymous");
          if(syncingWith == null || !syncingWith.equals(dbName)){
    				stopSyncing();
            startSyncing();
          }


          if(StaticValues.REACT_CONTEXT != null){
            StaticValues.REACT_CONTEXT.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
             .emit("LOGGED_IN", sharedpreferences.getString("loggedIn", "false"));
          }
          if(StaticValues.REACT_CONTEXT != null && liteListener != null){
            StaticValues.REACT_CONTEXT.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
             .emit("LISTNETR_STARTED", port);
          }
          if(StaticValues.REACT_CONTEXT != null && liteListener == null){
            StaticValues.REACT_CONTEXT.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
             .emit("LISTNETR_STOPPED", null);
          }
      }
  }

  protected void showToast(final String msg){
    //gets the main thread
    Handler handler = new Handler(Looper.getMainLooper());
    handler.post(new Runnable() {
        @Override
        public void run() {
            // run this code in the main thread
            Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_SHORT).show();
        }
    });
}
}
