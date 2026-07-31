#pragma once
#include <juce_audio_basics/juce_audio_basics.h>
#include <juce_audio_devices/juce_audio_devices.h>
#include <juce_audio_formats/juce_audio_formats.h>
#include "ProcessorChainAudioSource.h"
#include "juce_dsp/juce_dsp.h"
#include "JuceEvents.h"

class AudioEngine : public juce::ChangeListener
{
public:
    using FilterDuplicator = juce::dsp::ProcessorDuplicator<juce::dsp::IIR::Filter<float>,
                                                              juce::dsp::IIR::Coefficients<float>>;
    using ReverbChain = juce::dsp::ProcessorChain<FilterDuplicator,
                                                   FilterDuplicator,
                                                   juce::dsp::Reverb>;

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
        transportSource.addChangeListener(this);

        prepareFilters();

        setHighPassFrequency(20.0f, 0.707f);
        setLowPassFrequency(20000.0f, 0.707f);
    }

    ~AudioEngine()
    {
        transportSource.removeChangeListener(this);
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
    void setPosition(double position) { transportSource.setPosition(position); }
    void setLooping(bool looping) { transportSource.setLooping(looping); }

    double getCurrentPosition() { return transportSource.getCurrentPosition(); }
    double getLengthInSeconds() { return transportSource.getLengthInSeconds(); }
    bool isPlaying() { return transportSource.isPlaying(); }

    void setResamplingRatio(double ratio)
    {
        resamplingSource.setResamplingRatio(juce::jlimit(0.1, 4.0, ratio));
    }

    void setHighPassFrequency(float frequencyHz, float resonanceQ)
    {
        const float nyquistGuard = (float) getSampleRate() * 0.49f;
        highPassFreq = juce::jlimit(10.0f, nyquistGuard, frequencyHz);
        highPassRes  = juce::jlimit(0.1f, 20.0f, resonanceQ);
        updateHighPassCoefficients();
    }

    void setLowPassFrequency(float frequencyHz, float resonanceQ)
    {
        const float nyquistGuard = (float) getSampleRate() * 0.49f;
        lowPassFreq = juce::jlimit(10.0f, nyquistGuard, frequencyHz);
        lowPassRes  = juce::jlimit(0.1f, 20.0f, resonanceQ);
        updateLowPassCoefficients();
    }

    void setHighPassBypassed(bool shouldBeBypassed)
    {
        reverbSource.getChain().setBypassed<0>(shouldBeBypassed);
    }

    void setLowPassBypassed(bool shouldBeBypassed)
    {
        reverbSource.getChain().setBypassed<1>(shouldBeBypassed);
    }

    void setReverbParameters(const juce::dsp::Reverb::Parameters& params)
    {
        reverbSource.getChain().get<2>().setParameters(params);
    }

    void setReverbBypassed(bool shouldBeBypassed)
    {
        reverbSource.getChain().setBypassed<2>(shouldBeBypassed);
    }

    void changeListenerCallback(juce::ChangeBroadcaster* source) override
    {
        if (source != &transportSource)
            return;

        const bool finished = transportSource.hasStreamFinished();
        const bool playing  = transportSource.isPlaying();

        juce::MessageManager::callAsync([finished, playing]()
        {
            if (finished)
            {
                StatusChangeEvent("end");
            }
            else if (playing)
            {
                StatusChangeEvent("playing");
            }
            else
            {
                StatusChangeEvent("paused");
            }
        });
    }

private:
    void prepareFilters()
    {
        juce::dsp::ProcessSpec spec;
        spec.sampleRate = getSampleRate();
        spec.maximumBlockSize = 512;
        spec.numChannels = 2;

        if (auto* device = deviceManager.getCurrentAudioDevice())
        {
            spec.maximumBlockSize = (juce::uint32) juce::jmax(1, device->getCurrentBufferSizeSamples());
            const auto activeOutputs = device->getActiveOutputChannels().countNumberOfSetBits();
            spec.numChannels = (juce::uint32) juce::jmax(1, activeOutputs);
        }

        reverbSource.getChain().get<0>().prepare(spec);
        reverbSource.getChain().get<1>().prepare(spec);
    }

    double getSampleRate() const
    {
        if (auto* device = deviceManager.getCurrentAudioDevice())
        {
            const double sr = device->getCurrentSampleRate();
            if (sr > 0.0)
                return sr;
        }
        return 44100.0;
    }

    void updateHighPassCoefficients()
    {
        *reverbSource.getChain().get<0>().state =
            *juce::dsp::IIR::Coefficients<float>::makeHighPass(getSampleRate(), highPassFreq, highPassRes);
    }

    void updateLowPassCoefficients()
    {
        *reverbSource.getChain().get<1>().state =
            *juce::dsp::IIR::Coefficients<float>::makeLowPass(getSampleRate(), lowPassFreq, lowPassRes);
    }

    float highPassFreq = 20.0f;
    float lowPassFreq  = 20000.0f;
    float highPassRes  = 0.707f;
    float lowPassRes   = 0.707f;

    juce::AudioFormatManager formatManager;
    juce::AudioDeviceManager deviceManager;
    juce::AudioSourcePlayer sourcePlayer;
    juce::AudioTransportSource transportSource;
    juce::ResamplingAudioSource resamplingSource;
    std::unique_ptr<juce::AudioFormatReaderSource> readerSource;
    ProcessorChainAudioSource<ReverbChain> reverbSource;
};