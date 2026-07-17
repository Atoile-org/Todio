// android/app/src/main/cpp/juce_jni_bridge.cpp
//
// Minimal placeholder so todio_juce.so actually links something against the
// 7 JUCE modules. Replace/extend Java_com_todio_JuceBridge_* with your real
// entry points (starting the audio device manager, decoding a file, running
// a juce::dsp chain, etc). Rename the package/class to match wherever your
// Kotlin bridge class actually lives.

#include <jni.h>

#include <juce_core/juce_core.h>
#include <juce_events/juce_events.h>
#include <juce_data_structures/juce_data_structures.h>
#include <juce_audio_basics/juce_audio_basics.h>
#include <juce_audio_devices/juce_audio_devices.h>
#include <juce_audio_formats/juce_audio_formats.h>
#include <juce_dsp/juce_dsp.h>

// NOTE: we deliberately do NOT define JNI_OnLoad here. JUCE's own juce_core
// module (juce_Threads_android.cpp) already defines JNI_OnLoad to capture the
// JavaVM* for its own internal use - a second definition in this file causes
// a duplicate-symbol linker error. Do explicit init from Kotlin instead
// (call nativeInit() once, e.g. from your Application's onCreate).

extern "C" JNIEXPORT void JNICALL
Java_com_todio_JuceBridge_nativeInit(JNIEnv* /*env*/, jobject /*thiz*/)
{
    // Starts JUCE's message loop for this process. Needed before touching
    // juce::AudioDeviceManager, timers, async callbacks, etc. Safe to call
    // more than once; JUCE just returns the existing instance.
    juce::MessageManager::getInstance();
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_todio_JuceBridge_getJuceVersion(JNIEnv* env, jobject /*thiz*/)
{
    return env->NewStringUTF(juce::SystemStats::getJUCEVersion().toRawUTF8());
}
