package com.musis;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;
import com.spotify.android.appremote.api.error.CouldNotFindSpotifyApp;
import com.spotify.android.appremote.api.error.NotLoggedInException;
import com.spotify.android.appremote.api.error.UserNotAuthorizedException;
import com.spotify.protocol.types.Image;
import com.spotify.protocol.types.Track;

import java.util.Objects;

public class SpotifyModule extends ReactContextBaseJavaModule {

    private static final String CLIENT_ID = "651f37f1d33f4e198172233dbcb86c82";
    private static final String REDIRECT_URI = "musis://spotifylogin";
    private static ReactApplicationContext reactContext;
    private SpotifyAppRemote mSpotifyAppRemote;
    private boolean firstTimeWarning = true;

    SpotifyModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public void initialize() {
        super.initialize();
        LifecycleEventListener lifecycleEventListener = new LifecycleEventListener() {

            @Override
            public void onHostResume() {
                connect();
            }

            @Override
            public void onHostPause() {
                SpotifyAppRemote.disconnect(mSpotifyAppRemote);
            }

            @Override
            public void onHostDestroy() {
                SpotifyAppRemote.disconnect(mSpotifyAppRemote);
            }

        };
        getReactApplicationContext().addLifecycleEventListener(lifecycleEventListener);
    }

    private void connected() {
        mSpotifyAppRemote.getPlayerApi()
                .subscribeToPlayerState()
                .setEventCallback(playerState -> {
                    final Track track = playerState.track;
                    if (track != null) {
                        WritableMap params = Arguments.createMap();
                        params.putString("name", track.name);
                        params.putString("artist", track.artist.name);
                        params.putString("cover_url", track.imageUri.raw);
                        sendEvent("playerStateChanged", params);
                    }
                });
    }

    private void downloadAction(DialogInterface dialog, int which) {
        try {
            Uri uri = Uri.parse("market://details?id=" + "com.spotify.music");
            Objects.requireNonNull(getCurrentActivity()).startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (android.content.ActivityNotFoundException ignored) {
            Uri uri = Uri.parse("https://play.google.com/store/apps/details?id=com.spotify.music");
            Objects.requireNonNull(getCurrentActivity()).startActivity(new Intent(Intent.ACTION_VIEW, uri));
        }
    }

    private void exitAction(DialogInterface dialog, int which) {
        Objects.requireNonNull(getCurrentActivity()).finish();
        System.exit(0);
    }

    private void spotifyLoginAction(DialogInterface dialog, int which) {
        try {
            Uri uri = Uri.parse("spotify:");
            Objects.requireNonNull(getCurrentActivity()).startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (android.content.ActivityNotFoundException ignored) {
            Uri uri = Uri.parse("https://www.spotify.com");
            Objects.requireNonNull(getCurrentActivity()).startActivity(new Intent(Intent.ACTION_VIEW, uri));
        }
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void connect() {
        ConnectionParams connectionParams =
                new ConnectionParams.Builder(CLIENT_ID)
                        .setRedirectUri(REDIRECT_URI)
                        .showAuthView(true)
                        .build();
        SpotifyAppRemote.disconnect(mSpotifyAppRemote);
        SpotifyAppRemote.connect(getReactApplicationContext(), connectionParams,
                new Connector.ConnectionListener() {
                    @Override
                    public void onConnected(SpotifyAppRemote spotifyAppRemote) {
                        mSpotifyAppRemote = spotifyAppRemote;
                        WritableMap params = Arguments.createMap();
                        params.putString("status", "connected");
                        sendEvent("status", params);
                        connected();
                    }

                    @Override
                    public void onFailure(Throwable error) {
                        WritableMap params = Arguments.createMap();
                        params.putString("status", "disconnected");
                        sendEvent("status", params);
                        AlertDialog.Builder builder = new AlertDialog.Builder(getCurrentActivity());
                        AlertDialog LoginBtn = builder.setTitle("Spotify app login")
                                .setMessage("You must be logged in your Spotify app to fully use this app!")
                                .setPositiveButton("LOG IN", SpotifyModule.this::spotifyLoginAction)
                                .setNegativeButton("CLOSE", null)
                                .setCancelable(false)
                                .create();
                        AlertDialog AuthBtn = builder.setTitle("Spotify app authorization")
                                .setMessage("You must authorize this app with your Spotify account to fully use this app!")
                                .setPositiveButton("LOG IN", SpotifyModule.this::spotifyLoginAction)
                                .setNegativeButton("CLOSE", null)
                                .setCancelable(false)
                                .create();
                        AlertDialog InstallBtn = builder.setTitle("Spotify app not installed")
                                .setMessage("You must download the Spotify app first to fully use this app!")
                                .setPositiveButton("DOWNLOAD", SpotifyModule.this::downloadAction)
                                .setNegativeButton("CLOSE", null)
                                .setCancelable(false)
                                .create();
                        if (error instanceof NotLoggedInException || error instanceof UserNotAuthorizedException) {
                            // Show login button and trigger the login flow from auth library when clicked
                            if (error instanceof NotLoggedInException) {
                                if(firstTimeWarning) LoginBtn.show();
                            }
                            if (error instanceof UserNotAuthorizedException) {
                                if(firstTimeWarning) AuthBtn.show();
                            }
                        } else if (error instanceof CouldNotFindSpotifyApp) {
                            if(firstTimeWarning) InstallBtn.show();
                        } else {
                            Log.d("MainActivity", "disconnected");
                        }
                        firstTimeWarning = false;
                    }
                });
    }

    @Override
    public String getName() {
        return "SpotifyModule";
    }

}