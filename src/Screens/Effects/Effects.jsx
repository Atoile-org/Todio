import Slider from '@react-native-community/slider';
import { NativeModules, Pressable, StyleSheet, Text, View } from 'react-native';
import { useContext, useState } from 'react';
import { TodioCtx } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pickAudioFiles } from '../../utils/filesUtils';
import { Import } from 'lucide-react-native/icons';
import { LucideAudioWaveform } from 'lucide-react-native';

export default function Effects() {
  const { theme, playing, effects, setEffects } = useContext(TodioCtx);
  const { JuceBridge } = NativeModules;

  const [speed, setSpeed] = useState(effects?.speed || 1);

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

      <View style={styles.effects}>
        <Text style={[{ color: theme.textPrimary }]}>
          Speed: {speed ? Number(speed).toFixed(2) : ''}
        </Text>
        <Slider
          minimumValue={0.1}
          maximumValue={4}
          step={0.05}
          value={speed}
          onValueChange={v => {
            setSpeed(v);
            JuceBridge.setResamplingRatio(v);
          }}
          onSlidingComplete={v => {
            setEffects({ ...effects, speed: v });
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
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8
  },
  topText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 'auto',
  },
  effects: {
    padding: 16
  }
})