package com.todio;

public class JuceBridge {

    static {
        System.loadLibrary("todio_juce");
    }

    // Existing
    public static native String getJuceVersion();

    // Playback engine
    public static native void audioInit();
    public static native boolean audioLoadFile(String path);
    public static native void audioPlay();
    public static native void audioPause();
    public static native void audioStop();
    public static native void setResamplingRatio(float ratio);
    public static native double getCurrentPosition();
    public static native double getLengthInSeconds();
    public static native boolean isPlaying();
}
