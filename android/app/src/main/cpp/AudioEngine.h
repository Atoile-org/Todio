#pragma once
#include <juce_audio_basics/juce_audio_basics.h>
#include <juce_audio_devices/juce_audio_devices.h>
#include <juce_audio_formats/juce_audio_formats.h>

class AudioEngine
{
public:
    AudioEngine()
        // ResamplingAudioSource wraps transportSource permanently (not per-file).
        // false = don't try to delete transportSource for us, we own it as a member.
        : resamplingSource(&transportSource, false, 2)
    {
        formatManager.registerBasicFormats();

        // NOTE: deliberately NOT using initialiseWithDefaultDevices() here.
        // That call also enumerates MIDI devices, which pulls in
        // juce::MidiDeviceListConnectionBroadcaster / AndroidMidiHelpers -
        // and that path does JNI class lookups that aren't safe this early
        // in the app's lifecycle when called from an external (non-JUCE)
        // Activity. Plain initialise() with 0 MIDI in/out avoids it.
        auto error = deviceManager.initialise(
            0,       // input channels
            2,       // output channels
            nullptr, // no saved XML state
            true     // selectDefaultDeviceOnFailure
        );

        if (error.isNotEmpty())
            juce::Logger::writeToLog("AudioEngine: device init failed - " + error);

        // sourcePlayer now pulls from resamplingSource (which pulls from
        // transportSource) instead of pulling from transportSource directly.
        sourcePlayer.setSource(&resamplingSource);
        deviceManager.addAudioCallback(&sourcePlayer);
    }

    ~AudioEngine()
    {
        deviceManager.removeAudioCallback(&sourcePlayer);
        sourcePlayer.setSource(nullptr);
        resamplingSource.releaseResources();
        transportSource.setSource(nullptr);
    }

    bool loadFile(const juce::String& path)
    {
        auto* reader = formatManager.createReaderFor(juce::File(path));
        if (reader == nullptr)
            return false;

        auto newSource = std::make_unique<juce::AudioFormatReaderSource>(reader, true);
        transportSource.setSource(newSource.get(), 0, nullptr, reader->sampleRate);
        readerSource = std::move(newSource);
        return true;
    }

    void play()  { transportSource.start(); }
    void pause() { transportSource.stop(); }
    void stop()  { transportSource.stop(); transportSource.setPosition(0.0); }
    void setPosition( double position )  { transportSource.setPosition( position ); }

    double getCurrentPosition() { return transportSource.getCurrentPosition(); }
    double getLengthInSeconds() { return transportSource.getLengthInSeconds(); }
    bool isPlaying() { return transportSource.isPlaying(); }

    void setResamplingRatio(double ratio)
    {
        // Guard against 0/negative ratios - ResamplingAudioSource will
        // misbehave (or assert) if fed a non-positive ratio.
        resamplingSource.setResamplingRatio(juce::jlimit(0.1, 4.0, ratio));
    }

private:
    juce::AudioFormatManager formatManager;
    juce::AudioDeviceManager deviceManager;
    juce::AudioSourcePlayer sourcePlayer;
    juce::AudioTransportSource transportSource;
    juce::ResamplingAudioSource resamplingSource;
    std::unique_ptr<juce::AudioFormatReaderSource> readerSource;
};
