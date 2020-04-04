package com.musis;

import android.util.Log;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;
import com.spotify.protocol.types.Track;

public class SpotifyModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    private static final String CLIENT_ID = "651f37f1d33f4e198172233dbcb86c82";
    private static final String REDIRECT_URI = "https://us-central1-musis-app.cloudfunctions.net/callback";
    private SpotifyAppRemote mSpotifyAppRemote;

    SpotifyModule(ReactApplicationContext context) {
        super(context);
        LifecycleEventListener lifecycleEventListener = new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                ConnectionParams connectionParams =
                        new ConnectionParams.Builder(CLIENT_ID)
                                .setRedirectUri(REDIRECT_URI)
                                .showAuthView(true)
                                .build();

                SpotifyAppRemote.connect(getReactApplicationContext(), connectionParams,
                        new Connector.ConnectionListener() {

                            public void onConnected(SpotifyAppRemote spotifyAppRemote) {
                                mSpotifyAppRemote = spotifyAppRemote;
                                Log.d("MainActivity", "Connected! Yay!");
                                // Now you can start interacting with App Remote
                                connected();
                            }

                            public void onFailure(Throwable throwable) {
                                Log.e("MyActivity", throwable.getMessage(), throwable);
                                // Something went wrong when attempting to connect! Handle errors here
                            }
                        });
            }

            @Override
            public void onHostPause() {
            }

            @Override
            public void onHostDestroy() {
                SpotifyAppRemote.disconnect(mSpotifyAppRemote);
            }

        };
        getReactApplicationContext().addLifecycleEventListener(lifecycleEventListener);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "SpotifyModule";
    }

    private void connected() {
        // Play a playlist
        mSpotifyAppRemote.getPlayerApi().play("spotify:playlist:37i9dQZF1DX2sUQwD7tbmL");

        // Subscribe to PlayerState
        mSpotifyAppRemote.getPlayerApi()
                .subscribeToPlayerState()
                .setEventCallback(playerState -> {
                    final Track track = playerState.track;
                    if (track != null) {
                        Log.d("MainActivity", track.name + " by " + track.artist.name);
                    }
                });
    }

//    Passing constants to JS
//    @Override
//    public Map<String, Object> getConstants() {
//        final Map<String, Object> constants = new HashMap<>();
//        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
//        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
//        return constants;
//    }

//    Function callable from JS
//    @ReactMethod
//    public void show(String message, int duration) {
//        Toast.makeText(getReactApplicationContext(), message, duration).show();
//    }
}