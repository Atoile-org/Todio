package com.todio;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ReactJuceBridge extends ReactContextBaseJavaModule {

    @NonNull
    @Override
    public String getName() {
        return "JuceBridge";
    }

    @ReactMethod
    public void audioLoadFile(String path) {
        JuceBridge.audioLoadFile(path);
    }

    @ReactMethod
    public void audioPlay() {
        JuceBridge.audioPlay();
    }

    @ReactMethod
    public void audioPause() {
        JuceBridge.audioPause();
    }

    @ReactMethod
    public void audioStop() {
        JuceBridge.audioStop();
    }

    @ReactMethod
    public void setPosition(double position) {
        JuceBridge.setPosition(position);
    }

    @ReactMethod
    public void setResamplingRatio(float ratio) {
        JuceBridge.setResamplingRatio(ratio);
    }

    @ReactMethod
    public void getCurrentPosition(Promise promise) {
        try {
            promise.resolve(JuceBridge.getCurrentPosition());
        } catch (Exception e) {
            promise.reject("JUCE_ERROR", e);
        }
    }

    @ReactMethod
    public void getLengthInSeconds(Promise promise) {
        try {
            promise.resolve(JuceBridge.getLengthInSeconds());
        } catch (Exception e) {
            promise.reject("JUCE_ERROR", e);
        }
    }

    @ReactMethod
    public void isPlaying(Promise promise) {
        try {
            promise.resolve(JuceBridge.isPlaying());
        } catch (Exception e) {
            promise.reject("JUCE_ERROR", e);
        }
    }
}