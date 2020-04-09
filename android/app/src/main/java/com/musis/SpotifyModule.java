package com.musis;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;
import com.spotify.android.appremote.api.error.CouldNotFindSpotifyApp;
import com.spotify.android.appremote.api.error.NotLoggedInException;
import com.spotify.android.appremote.api.error.UserNotAuthorizedException;
import com.spotify.protocol.types.PlayerState;
import com.spotify.protocol.types.Track;

public class SpotifyModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static final String CLIENT_ID = "651f37f1d33f4e198172233dbcb86c82";
    private static final String REDIRECT_URI = "musis://spotifylogin"; // dela vubec neco?
    private SpotifyAppRemote mSpotifyAppRemote;

    SpotifyModule(ReactApplicationContext context) {
        super(context);
        // kdy se vola?
        Log.d("MainActivity", "SPOTIFYMODULE CONSTRUCTOR");
        LifecycleEventListener lifecycleEventListener = new LifecycleEventListener() {
            ConnectionParams connectionParams =
                    new ConnectionParams.Builder(CLIENT_ID)
                            .setRedirectUri(REDIRECT_URI)
                            .showAuthView(true)
                            .build();
            @Override
            public void onHostResume() {
                // melo by to byt tu vubec?
                SpotifyAppRemote.disconnect(mSpotifyAppRemote);
                SpotifyAppRemote.connect(getReactApplicationContext(), connectionParams,
                        new Connector.ConnectionListener() {
                            @Override
                            public void onConnected(SpotifyAppRemote spotifyAppRemote) {
                                mSpotifyAppRemote = spotifyAppRemote;
                                connected();
                            }
                            @Override
                            public void onFailure(Throwable error) {
                                Log.e("MainActivity", error.getMessage(), error);
                                if (error instanceof NotLoggedInException || error instanceof UserNotAuthorizedException) {
                                    // Show login button and trigger the login flow from auth library when clicked
                                    // NotLoggedInException -> presmerovat na spotify login screen
                                    // UserNotAuthorizedException -> rict ze jinak appku nemuze pouzivat
                                } else if (error instanceof CouldNotFindSpotifyApp) {
                                    AlertDialog.Builder builder = new AlertDialog.Builder(getCurrentActivity());
                                    builder.setTitle("Spotify App not installed")
                                            .setMessage("You must download the Spotify app first!")
                                            .setPositiveButton("DOWNLOAD", SpotifyModule.this::downloadAction)
                                            .setNegativeButton("CLOSE", SpotifyModule.this::exitAction)
                                            .create()
                                            .show();
                                }
                            }
                        });
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
        reactContext = context;
    }

    private void connected() {
        mSpotifyAppRemote.getPlayerApi()
                .subscribeToPlayerState()
                .setEventCallback(playerState -> {
                    final Track track = playerState.track;
                    final boolean isPaused = playerState.isPaused;
                    if (track != null) {
                        Log.d("MainActivity", ("playerStateChanged --- " + track.name + " -> " + isPaused));
                        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("playerStateChanged", track);
                    }
                });
    }

    private void downloadAction(DialogInterface dialog, int which) {
        try {
            Uri uri = Uri.parse("market://details?id=" + "com.spotify.music");
            getCurrentActivity().startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch(android.content.ActivityNotFoundException ignored) {
            Uri uri = Uri.parse("https://play.google.com/store/apps/details?id=com.spotify.music");
            getCurrentActivity().startActivity(new Intent(Intent.ACTION_VIEW, uri));
        }
    }

    private void exitAction(DialogInterface dialog, int which) {
        getCurrentActivity().finish();
        System.exit(0);
    }

    @Override
    public String getName() {
        return "SpotifyModule";
    }

}