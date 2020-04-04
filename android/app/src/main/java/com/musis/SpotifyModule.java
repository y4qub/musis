package com.musis;

import android.util.Log;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;
import com.spotify.android.appremote.api.error.CouldNotFindSpotifyApp;
import com.spotify.android.appremote.api.error.NotLoggedInException;
import com.spotify.android.appremote.api.error.UserNotAuthorizedException;
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
                //System.out.println("SPOTIFY HOST RESUME");
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
                                System.out.println("SPOTIFY CONNECTED");
                                mSpotifyAppRemote = spotifyAppRemote;
                                Log.d("MainActivity", "Connected! Yay!");
                                // Now you can start interacting with App Remote
                                connected();
                            }

                            @Override
                            public void onFailure(Throwable error) {
                                System.out.println("SPOTIFY FAILURE");
                                System.out.println(error.toString());
                                if (error instanceof NotLoggedInException || error instanceof UserNotAuthorizedException) {
                                    // Show login button and trigger the login flow from auth library when clicked
                                } else if (error instanceof CouldNotFindSpotifyApp) {
                                    // Show button to download Spotify
                                }
                            }
                        });
            }

            @Override
            public void onHostPause() {
//                System.out.println("SPOTIFY PAUSE");
                SpotifyAppRemote.disconnect(mSpotifyAppRemote);
            }

            @Override
            public void onHostDestroy() {
                System.out.println("SPOTIFY DESTROY");
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