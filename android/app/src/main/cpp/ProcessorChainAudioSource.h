#pragma once
#include <juce_audio_basics/juce_audio_basics.h>
#include "juce_dsp/juce_dsp.h"

template <typename ProcessorChainType>
class ProcessorChainAudioSource : public juce::AudioSource
{
public:
    ProcessorChainAudioSource(juce::AudioSource* inputSourceToUse, bool deleteWhenRemoved)
        : input(inputSourceToUse, deleteWhenRemoved)
    {
    }

    ProcessorChainType& getChain() { return chain; }

    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override
    {
        input->prepareToPlay(samplesPerBlockExpected, sampleRate);

        juce::dsp::ProcessSpec spec;
        spec.sampleRate       = sampleRate;
        spec.maximumBlockSize = (juce::uint32) samplesPerBlockExpected;
        spec.numChannels      = 2;
        chain.prepare(spec);
    }

    void releaseResources() override
    {
        input->releaseResources();
    }

    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override
    {
        input->getNextAudioBlock(bufferToFill);

        juce::dsp::AudioBlock<float> block(*bufferToFill.buffer);
        auto subBlock = block.getSubBlock((size_t) bufferToFill.startSample,
                                           (size_t) bufferToFill.numSamples);

        juce::dsp::ProcessContextReplacing<float> context(subBlock);
        chain.process(context);
    }

private:
    juce::OptionalScopedPointer<juce::AudioSource> input;
    ProcessorChainType chain;
};