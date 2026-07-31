import Slider from '@react-native-community/slider';
import {
  NativeModules,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useContext, useState } from 'react';
import { TodioCtx } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LucideAudioWaveform } from 'lucide-react-native';
import { DEFAULT_PRESETS } from '../../utils/FilterPresets';

const DEFAULT_REVERB = {
  roomSize: 0.4,
  damping: 1,
  wetLevel: 0.45,
  dryLevel: 0.35,
  width: 1,
  freezeMode: 0,
};

const DEFAULT_FILTERS = {
  highPass: 20,
  highPassQ: 0.707,
  lowPass: 20000,
  lowPassQ: 0.707,
};

function LabeledSwitch({ label, value, onValueChange, disabled }) {
  const { theme } = useContext(TodioCtx);
  return (
    <View style={styles.switchRow}>
      <Text
        style={[
          styles.rowLabel,
          { color: theme.textPrimary },
          disabled && styles.disabledText,
        ]}
      >
        {label}
      </Text>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
}

function EffectSlider({
  label,
  value,
  onValueChange,
  onSlidingComplete,
  minimumValue = 0,
  maximumValue = 1,
  step = 0.01,
  disabled = false,
  formatValue = v => Number(v).toFixed(2),
}) {
  const { theme } = useContext(TodioCtx);
  return (
    <View style={styles.sliderBlock}>
      <View style={styles.sliderLabelRow}>
        <Text
          style={[
            styles.rowLabel,
            { color: theme.textPrimary },
            disabled && styles.disabledText,
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.valueText,
            { color: theme.textSecondary ?? theme.textPrimary },
            disabled && styles.disabledText,
          ]}
        >
          {formatValue(value)}
        </Text>
      </View>
      <Slider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        disabled={disabled}
      />
    </View>
  );
}

export default function Effects() {
  const { theme, effects, setEffects } = useContext(TodioCtx);
  const { JuceBridge } = NativeModules;

  const [speed, setSpeed] = useState(effects?.speed ?? 1);
  const [reverbEnabled, setReverbEnabled] = useState(
    effects?.reverb?.enabled ?? false,
  );
  const [reverb, setReverb] = useState({
    ...DEFAULT_REVERB,
    ...effects?.reverb,
  });

  const [highPassEnabled, setHighPassEnabled] = useState(
    effects?.filters?.highPassEnabled ?? false,
  );
  const [lowPassEnabled, setLowPassEnabled] = useState(
    effects?.filters?.lowPassEnabled ?? false,
  );
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...effects?.filters,
  });

  const pushHighPassToNative = next => {
    JuceBridge.setHighPassFrequency(next.highPass, next.highPassQ);
  };

  const pushLowPassToNative = next => {
    JuceBridge.setLowPassFrequency(next.lowPass, next.lowPassQ);
  };

  const updateFilterParam = (key, v) => {
    const next = { ...filters, [key]: v };
    setFilters(next);
    if (key === 'highPass' || key === 'highPassQ') pushHighPassToNative(next);
    else pushLowPassToNative(next);
  };

  const commitFilters = next => {
    setEffects({
      ...effects,
      filters: { ...next, highPassEnabled, lowPassEnabled },
    });
  };

  const handleHighPassToggle = enabled => {
    setHighPassEnabled(enabled);
    JuceBridge.setHighPassBypass(!enabled);
    if (enabled) pushHighPassToNative(filters);
    setEffects({
      ...effects,
      filters: { ...filters, highPassEnabled: enabled, lowPassEnabled },
    });
  };

  const handleLowPassToggle = enabled => {
    setLowPassEnabled(enabled);
    JuceBridge.setLowPassBypass(!enabled);
    if (enabled) pushLowPassToNative(filters);
    setEffects({
      ...effects,
      filters: { ...filters, lowPassEnabled: enabled, highPassEnabled },
    });
  };

  const pushReverbToNative = next => {
    JuceBridge.setReverb(
      next.roomSize,
      next.damping,
      next.wetLevel,
      next.dryLevel,
      next.width,
      next.freezeMode,
    );
  };

  const updateReverbParam = (key, v) => {
    const next = { ...reverb, [key]: v };
    setReverb(next);
    pushReverbToNative(next);
  };

  const commitReverb = next => {
    setEffects({ ...effects, reverb: { ...next, enabled: reverbEnabled } });
  };

  const handleReverbToggle = enabled => {
    console.log(JuceBridge);
    setReverbEnabled(enabled);
    JuceBridge.setReverbBypass(!enabled);
    if (enabled) pushReverbToNative(reverb);
    setEffects({ ...effects, reverb: { ...reverb, enabled } });
  };

  function handlePreset(preset) {
    setSpeed(preset.speed);
    JuceBridge.setResamplingRatio(preset.speed);

    const presetReverb = preset?.reverb;
    const reverbOn = !!presetReverb?.enable;

    let nextReverb;
    if (reverbOn) {
      nextReverb = { ...DEFAULT_REVERB, ...presetReverb };
      setReverb(nextReverb);
      setReverbEnabled(true);
      JuceBridge.setReverbBypass(false);
      pushReverbToNative(nextReverb);
    } else {
      nextReverb = reverb;
      setReverbEnabled(false);
      JuceBridge.setReverbBypass(true);
    }

    const presetHpf = preset?.hpf;
    const highPassOn = !!presetHpf?.enable;

    const presetLpf = preset?.lpf;
    const lowPassOn = !!presetLpf?.enable;

    const nextFilters = {
      ...filters,
      ...(highPassOn && {
        highPass: presetHpf.frequency ?? filters.highPass,
        highPassQ: presetHpf.resonance ?? filters.highPassQ,
      }),
      ...(lowPassOn && {
        lowPass: presetLpf.frequency ?? filters.lowPass,
        lowPassQ: presetLpf.resonance ?? filters.lowPassQ,
      }),
    };
    setFilters(nextFilters);

    setHighPassEnabled(highPassOn);
    JuceBridge.setHighPassBypass(!highPassOn);
    if (highPassOn) pushHighPassToNative(nextFilters);

    setLowPassEnabled(lowPassOn);
    JuceBridge.setLowPassBypass(!lowPassOn);
    if (lowPassOn) pushLowPassToNative(nextFilters);

    setEffects({
      ...effects,
      speed: preset.speed,
      reverb: { ...nextReverb, enabled: reverbOn },
      filters: {
        ...nextFilters,
        highPassEnabled: highPassOn,
        lowPassEnabled: lowPassOn,
      },
    });
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView>
        <View>
          <View style={styles.header}>
            <LucideAudioWaveform color={theme.textPrimary} size={30} />
            <Text style={[styles.topText, { color: theme.textPrimary }]}>
              Effects
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={styles.presetContainer}
          >
            {DEFAULT_PRESETS.map((item, index) => (
              <View
                style={{
                  borderRadius: 50,
                  overflow: 'hidden',
                  borderColor: theme.border,
                  borderWidth: 1,
                  marginLeft: index === 0 ? 16 : 0,
                }}
              >
                <Pressable
                  style={[
                    {
                      backgroundColor: theme.surface,
                    },
                    styles.presetElement,
                  ]}
                  android_ripple={{ color: theme.accentMuted }}
                  onPress={() => handlePreset(item)}
                >
                  <Text style={{ color: theme.textPrimary }}>{item.name}</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <View
            style={[
              styles.section,
              { backgroundColor: theme.card ?? theme.background },
            ]}
          >
            <EffectSlider
              label="Speed"
              value={speed}
              minimumValue={0.1}
              maximumValue={4}
              step={0.05}
              onValueChange={v => {
                setSpeed(v);
                JuceBridge.setResamplingRatio(v);
              }}
              onSlidingComplete={v => setEffects({ ...effects, speed: v })}
            />
          </View>

          <View
            style={[
              styles.section,
              { backgroundColor: theme.card ?? theme.background },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                High-Pass Filter
              </Text>
              <Switch
                value={highPassEnabled}
                onValueChange={handleHighPassToggle}
              />
            </View>

            <EffectSlider
              label="Frequency"
              value={filters.highPass}
              disabled={!highPassEnabled}
              minimumValue={20}
              maximumValue={5000}
              step={1}
              formatValue={v => `${Math.round(v)} Hz`}
              onValueChange={v => updateFilterParam('highPass', v)}
              onSlidingComplete={() => commitFilters(filters)}
            />
            <EffectSlider
              label="Resonance"
              value={filters.highPassQ}
              disabled={!highPassEnabled}
              minimumValue={0.1}
              maximumValue={18}
              step={0.01}
              formatValue={v => Number(v).toFixed(2)}
              onValueChange={v => updateFilterParam('highPassQ', v)}
              onSlidingComplete={() => commitFilters(filters)}
            />
          </View>

          <View
            style={[
              styles.section,
              { backgroundColor: theme.card ?? theme.background },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Low-Pass Filter
              </Text>
              <Switch
                value={lowPassEnabled}
                onValueChange={handleLowPassToggle}
              />
            </View>

            <EffectSlider
              label="Frequency"
              value={filters.lowPass}
              disabled={!lowPassEnabled}
              minimumValue={5000}
              maximumValue={20000}
              step={1}
              formatValue={v => `${Math.round(v)} Hz`}
              onValueChange={v => updateFilterParam('lowPass', v)}
              onSlidingComplete={() => commitFilters(filters)}
            />
            <EffectSlider
              label="Resonance"
              value={filters.lowPassQ}
              disabled={!lowPassEnabled}
              minimumValue={0.1}
              maximumValue={18}
              step={0.01}
              formatValue={v => Number(v).toFixed(2)}
              onValueChange={v => updateFilterParam('lowPassQ', v)}
              onSlidingComplete={() => commitFilters(filters)}
            />
          </View>

          <View
            style={[
              styles.section,
              { backgroundColor: theme.card ?? theme.background },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                Reverb
              </Text>
              <Switch
                value={reverbEnabled}
                onValueChange={handleReverbToggle}
              />
            </View>

            <EffectSlider
              label="Room Size"
              value={reverb.roomSize}
              disabled={!reverbEnabled}
              onValueChange={v => updateReverbParam('roomSize', v)}
              onSlidingComplete={() => commitReverb(reverb)}
            />
            <EffectSlider
              label="Damping"
              value={reverb.damping}
              disabled={!reverbEnabled}
              onValueChange={v => updateReverbParam('damping', v)}
              onSlidingComplete={() => commitReverb(reverb)}
            />
            <EffectSlider
              label="Wet Level"
              value={reverb.wetLevel}
              disabled={!reverbEnabled}
              onValueChange={v => updateReverbParam('wetLevel', v)}
              onSlidingComplete={() => commitReverb(reverb)}
            />
            <EffectSlider
              label="Dry Level"
              value={reverb.dryLevel}
              disabled={!reverbEnabled}
              onValueChange={v => updateReverbParam('dryLevel', v)}
              onSlidingComplete={() => commitReverb(reverb)}
            />
            <EffectSlider
              label="Width"
              value={reverb.width}
              disabled={!reverbEnabled}
              onValueChange={v => updateReverbParam('width', v)}
              onSlidingComplete={() => commitReverb(reverb)}
            />
            <LabeledSwitch
              label="Freeze Mode"
              value={reverb.freezeMode >= 0.5}
              disabled={!reverbEnabled}
              onValueChange={v => {
                const next = { ...reverb, freezeMode: v ? 1 : 0 };
                setReverb(next);
                pushReverbToNative(next);
                commitReverb(next);
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  topText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 'auto',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sliderBlock: {
    marginTop: 8,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rowLabel: {
    fontSize: 15,
  },
  valueText: {
    fontSize: 14,
    opacity: 0.8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginRight: 'auto',
  },
  disabledText: {
    opacity: 0.4,
  },

  presetContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  presetElement: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 50,
  },
});
