package com.todio.react;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.todio.youtube.YouTubeMusicExtractor;

import java.util.List;

public class ReactYouTubeMusicBridge extends ReactContextBaseJavaModule {

    private static final String ERROR_TAG = "YOUTUBE_MUSIC";

    public ReactYouTubeMusicBridge(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "YouTubeMusicBridge";
    }

    @ReactMethod
    public void searchSongs(String query, int limit, Promise promise) {
        try {
            List<YouTubeMusicExtractor.YouTubeMusicResult> results = YouTubeMusicExtractor.searchSongs(query, 1, limit);
            WritableArray array = Arguments.createArray();

            for (YouTubeMusicExtractor.YouTubeMusicResult result : results) {
                array.pushMap(convertToMap(result));
            }

            promise.resolve(array);
        } catch (Exception e) {
            promise.reject(ERROR_TAG, e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getSearchSuggestions(String query, Promise promise) {
        try {
            List<String> suggestions = YouTubeMusicExtractor.getSearchSuggestions(query);
            WritableArray array = Arguments.createArray();

            for (String suggestion : suggestions) {
                array.pushString(suggestion);
            }

            promise.resolve(array);
        } catch (Exception e) {
            promise.reject(ERROR_TAG, e.getMessage(), e);
        }
    }

    private WritableMap convertToMap(YouTubeMusicExtractor.YouTubeMusicResult result) {
        WritableMap map = Arguments.createMap();

        map.putString("title", result.title);
        map.putString("url", result.url);
        map.putString("thumbnailUrl", result.thumbnailUrl);
        map.putString("author", result.author);
        map.putString("authorUrl", result.authorUrl);
        map.putString("authorAvatar", result.authorAvatar);
        map.putDouble("duration", (double) result.duration); // seconds
        map.putDouble("viewCount", (double) result.viewCount);
        map.putString("uploadDateText", result.uploadDateText);

        String durationFormatted = result.getDurationFormatted();
        if (durationFormatted != null) {
            map.putString("durationFormatted", durationFormatted);
        }

        return map;
    }
}