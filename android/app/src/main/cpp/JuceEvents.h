#pragma once
#include <jni.h>
#include <string>

void InitJuceEvents(JavaVM* vm, JNIEnv* env);
void StatusChangeEvent(const std::string& status);