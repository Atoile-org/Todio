import Slider from '@react-native-community/slider';
import { NativeModules, StyleSheet, Switch, Text, View } from 'react-native';
import { useContext, useState } from 'react';
import { TodioCtx } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LucideAudioWaveform } from 'lucide-react-native';

const DEFAULT_REVERB = {
  roomSize: 0.40,
  damping: 0.60,
  wetLevel: 0.45,
  dryLevel: 0.50,
  width: 0.40,
  freezeMode: 0,
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <LucideAudioWaveform color={theme.textPrimary} size={30} />
        <Text style={[styles.topText, { color: theme.textPrimary }]}>
          Effects
        </Text>
      </View>

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
            Reverb
          </Text>
          <Switch value={reverbEnabled} onValueChange={handleReverbToggle} />
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
});
