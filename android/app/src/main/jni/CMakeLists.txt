cmake_minimum_required(VERSION 3.13)
project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../cpp juce_build)

target_link_libraries(${CMAKE_PROJECT_NAME} todio_juce)