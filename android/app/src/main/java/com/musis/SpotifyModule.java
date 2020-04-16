package com.musis;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;
import com.spotify.android.appremote.api.error.CouldNotFindSpotifyApp;
import com.spotify.android.appremote.api.error.NotLoggedInException;
import com.spotify.android.appremote.api.error.UserNotAuthorizedException;
import com.spotify.protocol.types.Track;

import java.util.Objects;

public class SpotifyModule extends ReactContextBaseJavaModule {

    private static final String CLIENT_ID = "651f37f1d33f4e198172233dbcb86c82";
    private static final String REDIRECT_URI = "musis://spotifylogin";
    private static ReactApplicationContext reactContext;
    private SpotifyAppRemote mSpotifyAppRemote;

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
                        sendEvent("playerStateChanged", track);
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

    private void sendEvent(String eventName, Object data) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, data);
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
                        sendEvent("status", "connected");
                        connected();
                    }

                    @Override
                    public void onFailure(Throwable error) {
                        sendEvent("status", "disconnected");
                        AlertDialog.Builder builder = new AlertDialog.Builder(getCurrentActivity());
                        AlertDialog LoginBtn = builder.setTitle("Spotify app login")
                                .setMessage("You must be logged in your Spotify app!")
                                .setPositiveButton("LOG IN", SpotifyModule.this::spotifyLoginAction)
                                .setNegativeButton("CLOSE", SpotifyModule.this::exitAction)
                                .setCancelable(false)
                                .create();
                        AlertDialog AuthBtn = builder.setTitle("Spotify app authorization")
                                .setMessage("You must authorize this app with your Spotify account before using it!")
                                .setPositiveButton("LOG IN", SpotifyModule.this::spotifyLoginAction)
                                .setNegativeButton("CLOSE", SpotifyModule.this::exitAction)
                                .setCancelable(false)
                                .create();
                        AlertDialog InstallBtn = builder.setTitle("Spotify app not installed")
                                .setMessage("You must download the Spotify app first!")
                                .setPositiveButton("DOWNLOAD", SpotifyModule.this::downloadAction)
                                .setNegativeButton("CLOSE", SpotifyModule.this::exitAction)
                                .setCancelable(false)
                                .create();
                        if (error instanceof NotLoggedInException || error instanceof UserNotAuthorizedException) {
                            // Show login button and trigger the login flow from auth library when clicked
                            if (error instanceof NotLoggedInException) {
                                LoginBtn.show();
                            }
                            if (error instanceof UserNotAuthorizedException) {
                                AuthBtn.show();
                            }
                        } else if (error instanceof CouldNotFindSpotifyApp) {
                            InstallBtn.show();
                        }
                    }
                });
    }

    @Override
    public String getName() {
        return "SpotifyModule";
    }

}