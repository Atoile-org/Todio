#include "AudioEngine.h"
#include <jni.h>

namespace { std::unique_ptr<AudioEngine> engine; }

extern "C" JNIEXPORT void JNICALL
Java_com_todio_JuceBridge_audioInit(JNIEnv*, jclass) {
    engine = std::make_unique<AudioEngine>();
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_todio_JuceBridge_audioLoadFile(JNIEnv* env, jclass, jstring path) {
    const char* cPath = env->GetStringUTFChars(path, nullptr);
    bool ok = engine && engine->loadFile(juce::String(cPath));
    env->ReleaseStringUTFChars(path, cPath);
    return ok;
}

extern "C" JNIEXPORT void JNICALL
Java_com_todio_JuceBridge_audioPlay(JNIEnv*, jclass)  { if (engine) engine->play();  }
extern "C" JNIEXPORT void JNICALL
Java_com_todio_JuceBridge_audioPause(JNIEnv*, jclass) { if (engine) engine->pause(); }
extern "C" JNIEXPORT void JNICALL
Java_com_todio_JuceBridge_audioStop(JNIEnv*, jclass)  { if (engine) engine->stop();  }
extern "C" JNIEXPORT void JNICALL
Java_com_todio_JuceBridge_setResamplingRatio(JNIEnv*, jclass, jfloat ratio) {
    if (engine) engine->setResamplingRatio(ratio);
}

extern "C" JNIEXPORT double JNICALL
Java_com_todio_JuceBridge_getCurrentPosition(JNIEnv*, jclass) {
    if (engine) return engine->getCurrentPosition();
    return 0.0;
}
extern "C" JNIEXPORT double JNICALL
Java_com_todio_JuceBridge_getLengthInSeconds(JNIEnv*, jclass) {
    if (engine) return engine->getLengthInSeconds();
    return 0.0;
}
extern "C" JNIEXPORT void JNICALL
Java_com_todio_JuceBridge_setPosition(JNIEnv*, jclass, jdouble position) {
    if (engine) engine->setPosition(position);
}
extern "C" JNIEXPORT jboolean JNICALL
Java_com_todio_JuceBridge_isPlaying(JNIEnv*, jclass) {
    if (engine) return engine->isPlaying();
    return false;
}