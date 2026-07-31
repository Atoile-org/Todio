package com.todio;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class JuceEvents extends ReactContextBaseJavaModule {
    private static JuceEvents instance;
    public JuceEvents(ReactApplicationContext context) {
        super(context);
        instance = this;
    }
    @NonNull
    @Override
    public String getName() {
        return "JuceEvents";
    }
    public static void onStateChange(String status) {
        if (instance == null) {
            System.out.println("JuceEvents: instance is null, dropping " + status);
            return;
        }
        instance.emit(status);

        System.out.println(status);
    }
    private void emit(String status) {
        ReactApplicationContext ctx = getReactApplicationContext();

        WritableMap params = Arguments.createMap();
        params.putString("status", status);

        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("JuceStateChange", params);
    }
}