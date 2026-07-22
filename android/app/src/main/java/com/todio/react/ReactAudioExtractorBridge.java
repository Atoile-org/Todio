package com.todio.react;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.todio.youtube.AudioExtractor;

import java.util.List;

public class ReactAudioExtractorBridge extends ReactContextBaseJavaModule {

    private static final String ERROR_TAG = "AUDIO_EXTRACTOR";

    public ReactAudioExtractorBridge(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "AudioExtractorBridge";
    }

    @ReactMethod
    public void getBestAudioStream(String videoUrl, Promise promise) {
        try {
            org.schabi.newpipe.extractor.stream.AudioStream stream = AudioExtractor.getBestAudioStream(videoUrl);

            if (stream == null) {
                promise.resolve(null);
                return;
            }

            promise.resolve(convertToMap(stream));
        } catch (Exception e) {
            promise.reject(ERROR_TAG, e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getAllAudioStreams(String videoUrl, Promise promise) {
        try {
            List<org.schabi.newpipe.extractor.stream.AudioStream> streams = AudioExtractor.extractAudioStreams(videoUrl);
            WritableArray array = Arguments.createArray();

            for (org.schabi.newpipe.extractor.stream.AudioStream stream : streams) {
                array.pushMap(convertToMap(stream));
            }

            promise.resolve(array);
        } catch (Exception e) {
            promise.reject(ERROR_TAG, e.getMessage(), e);
        }
    }

    private WritableMap convertToMap(org.schabi.newpipe.extractor.stream.AudioStream stream) {
        WritableMap map = Arguments.createMap();
        
        map.putString("url", stream.getContent());
        map.putInt("bitrate", stream.getAverageBitrate());
        map.putBoolean("isUrl", stream.isUrl());

        String codec = stream.getCodec();
        if (codec != null) {
            map.putString("codec", codec);
        }

        org.schabi.newpipe.extractor.MediaFormat format = stream.getFormat();
        if (format != null) {
            map.putString("format", format.toString());
            // MediaFormat carries the mime type, not AudioStream directly.
            String mimeType = format.getMimeType();
            if (mimeType != null) {
                map.putString("mimeType", mimeType);
            }
        }

        if (stream.getAudioTrackId() != null) {
            map.putString("audioTrackId", stream.getAudioTrackId());
        }

        if (stream.getAudioTrackName() != null) {
            map.putString("audioTrackName", stream.getAudioTrackName());
        }

        return map;
    }
}