package com.todio;

import androidx.annotation.NonNull;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import com.todio.react.ReactYouTubeMusicBridge;
import com.todio.react.ReactAudioExtractorBridge;
import com.todio.react.ReactYouTubeProfilePictureBridge;

public class JuceBridgePackage implements ReactPackage {

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new ReactJuceBridge());
        modules.add(new ReactYouTubeMusicBridge(reactContext));
        modules.add(new ReactAudioExtractorBridge(reactContext));
        modules.add(new ReactYouTubeProfilePictureBridge(reactContext));
        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}