cmake_minimum_required(VERSION 3.22)
project(todio_juce_native)

# ---------------------------------------------------------------------------
# Path to the JUCE checkout you already have vendored at
# android/app/src/main/cpp/JUCE  (this file lives next to it, one level up)
# ---------------------------------------------------------------------------
set(JUCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/JUCE")

if(NOT EXISTS "${JUCE_DIR}/modules")
    message(FATAL_ERROR "Couldn't find JUCE modules at ${JUCE_DIR}/modules - check the path")
endif()

# JUCE (8.x) ships a JUCE_MODULES_ONLY option that makes its own CMakeLists.txt
# return right after registering juce_add_module()/module targets, skipping
# extras/Build entirely. That means it never tries to build juceaide or any
# other host-side tool - exactly what we want for a modules-only Android build.
set(JUCE_MODULES_ONLY ON CACHE BOOL "" FORCE)

add_subdirectory(${JUCE_DIR} EXCLUDE_FROM_ALL)

# ---------------------------------------------------------------------------
# NOTE: we do NOT call juce_add_module() here. add_subdirectory(JUCE) above
# already walks JUCE_DIR/modules and auto-registers every built-in module it
# finds there (juce_core, juce_events, juce_dsp, ...) as its own target, with
# a juce::<module> namespaced alias. juce_add_module() is only for pulling in
# a module from OUTSIDE the JUCE tree - calling it again here for a module
# that's already inside modules/ tries to create a second target with the
# same name and fails with a CMP0002 "target already exists" error.
# We only need to link against the modules we actually want; nothing else
# (juce_gui_basics, juce_graphics, etc.) gets pulled in just because it
# exists on disk - only the targets listed in target_link_libraries below
# and their real dependencies get compiled.
# ---------------------------------------------------------------------------
# The actual .so loaded from Kotlin/Java via System.loadLibrary("todio_juce")
# Add any of your own .cpp files to this list alongside juce_jni_bridge.cpp.
# ---------------------------------------------------------------------------
add_library(todio_juce SHARED
    juce_jni_bridge.cpp
)

target_link_libraries(todio_juce PRIVATE
    juce::juce_core
    juce::juce_events
    juce::juce_data_structures
    juce::juce_audio_basics
    juce::juce_audio_devices
    juce::juce_audio_formats
    juce::juce_dsp
    android
    log
    OpenSLES
)

target_compile_definitions(todio_juce PRIVATE
    JUCE_STANDALONE_APPLICATION=0
    JUCE_USE_ANDROID_OPENSLES=1
    JUCE_USE_ANDROID_OBOE=0
    JUCE_USE_CURL=0
    JUCE_WEB_BROWSER=0
    JUCE_USE_MP3AUDIOFORMAT=1
    JUCE_MODAL_LOOPS_PERMITTED=0
)

target_compile_features(todio_juce PRIVATE cxx_std_17)
