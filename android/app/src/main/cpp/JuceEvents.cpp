#include "JuceEvents.h"
#include <android/log.h>

static JavaVM*   g_vm = nullptr;
static jclass    g_juceEventsClass = nullptr;
static jmethodID g_onStateChange = nullptr;

void InitJuceEvents(JavaVM* vm, JNIEnv* env)
{
    g_vm = vm;
    jclass local = env->FindClass("com/todio/JuceEvents");
    if (local == nullptr) {
        __android_log_print(ANDROID_LOG_ERROR, "JuceEvents", "FindClass failed");
        return;
    }
    g_juceEventsClass = (jclass)env->NewGlobalRef(local);
    env->DeleteLocalRef(local);
    g_onStateChange = env->GetStaticMethodID(g_juceEventsClass, "onStateChange", "(Ljava/lang/String;)V");
    if (g_onStateChange == nullptr) {
        __android_log_print(ANDROID_LOG_ERROR, "JuceEvents", "GetStaticMethodID failed");
    }
}

void StatusChangeEvent(const std::string& status)
{
    if (g_vm == nullptr || g_juceEventsClass == nullptr || g_onStateChange == nullptr)
        return;

    JNIEnv* env = nullptr;
    bool didAttach = false;

    jint ret = g_vm->GetEnv((void**)&env, JNI_VERSION_1_6);
    if (ret == JNI_EDETACHED)
    {
        g_vm->AttachCurrentThread(&env, nullptr);
        didAttach = true;
    }
    else if (ret != JNI_OK || env == nullptr)
    {
        return;
    }

    jstring jStatus = env->NewStringUTF(status.c_str());
    env->CallStaticVoidMethod(g_juceEventsClass, g_onStateChange, jStatus);

    if (env->ExceptionCheck())
    {
        env->ExceptionDescribe();
        env->ExceptionClear();
    }

    env->DeleteLocalRef(jStatus);

    if (didAttach)
        g_vm->DetachCurrentThread();
}