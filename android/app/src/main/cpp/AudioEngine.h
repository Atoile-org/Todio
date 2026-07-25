#pragma once
#include <juce_audio_basics/juce_audio_basics.h>
#include <juce_audio_devices/juce_audio_devices.h>
#include <juce_audio_formats/juce_audio_formats.h>
#include  "ProcessorChainAudioSource.h"

#include "juce_dsp/juce_dsp.h"

class AudioEngine
{
public:
    using ReverbChain = juce::dsp::ProcessorChain<juce::dsp::Reverb>;

    AudioEngine()
        : resamplingSource(&transportSource, false, 2)
        , reverbSource(&resamplingSource, false)
    {
        formatManager.registerBasicFormats();

        auto error = deviceManager.initialise(0, 2, nullptr, true);
        if (error.isNotEmpty())
            juce::Logger::writeToLog("AudioEngine: device init failed - " + error);

        sourcePlayer.setSource(&reverbSource);
        deviceManager.addAudioCallback(&sourcePlayer);
    }

    ~AudioEngine()
    {
        deviceManager.removeAudioCallback(&sourcePlayer);
        sourcePlayer.setSource(nullptr);
        resamplingSource.releaseResources();
        transportSource.setSource(nullptr);
        reverbSource.releaseResources();
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
    void setLooping( double looping )  { transportSource.setLooping( looping ); }

    double getCurrentPosition() { return transportSource.getCurrentPosition(); }
    double getLengthInSeconds() { return transportSource.getLengthInSeconds(); }
    bool isPlaying() { return transportSource.isPlaying(); }

    void setResamplingRatio(double ratio)
    {
        resamplingSource.setResamplingRatio(juce::jlimit(0.1, 4.0, ratio));
    }

    void setReverbParameters(const juce::dsp::Reverb::Parameters& params)
    {
        reverbSource.getChain().get<0>().setParameters(params);
    }

    void setReverbBypassed(bool shouldBeBypassed)
    {
        reverbSource.getChain().setBypassed<0>(shouldBeBypassed);
    }

private:
    juce::AudioFormatManager formatManager;
    juce::AudioDeviceManager deviceManager;
    juce::AudioSourcePlayer sourcePlayer;
    juce::AudioTransportSource transportSource;
    juce::ResamplingAudioSource resamplingSource;
    std::unique_ptr<juce::AudioFormatReaderSource> readerSource;
    ProcessorChainAudioSource<ReverbChain> reverbSource;
};
