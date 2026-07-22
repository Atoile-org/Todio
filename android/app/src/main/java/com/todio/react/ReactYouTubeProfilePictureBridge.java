package com.todio.react;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.todio.youtube.YouTubeProfilePictureExtractor;

public class ReactYouTubeProfilePictureBridge extends ReactContextBaseJavaModule {

    private static final String ERROR_TAG = "YOUTUBE_PROFILE";

    public ReactYouTubeProfilePictureBridge(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "YouTubeProfilePictureBridge";
    }

    @ReactMethod
    public void getChannelAvatarUrl(String channelUrl, Promise promise) {
        try {
            String url = YouTubeProfilePictureExtractor.getChannelAvatarUrl(channelUrl);
            promise.resolve(url);
        } catch (Exception e) {
            promise.reject(ERROR_TAG, e.getMessage(), e);
        }
    }
}