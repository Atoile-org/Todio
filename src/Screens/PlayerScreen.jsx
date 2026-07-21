import { NativeModules, Text, View, StyleSheet, Button } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import Slider from '@react-native-community/slider';

function usePlaybackPosition(pollIntervalMs = 1000) {
  const { JuceBridge } = NativeModules;
  const [position, setPosition] = useState(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      if (isDraggingRef.current) return;

      const pos = await JuceBridge.getCurrentPosition();

      if (!mounted || isDraggingRef.current) return;
      setPosition(pos);
    };

    sync();
    const pollId = setInterval(sync, pollIntervalMs);

    return () => {
      mounted = false;
      clearInterval(pollId);
    };
  }, [JuceBridge, pollIntervalMs]);

  return { position, setPosition, isDraggingRef };
}

export default function PlayerScreen() {
  const { JuceBridge } = NativeModules;
  const { position, setPosition, isDraggingRef } = usePlaybackPosition(100);
  const [length, setLength] = useState(0);
  const [speed, setSpeed] = useState();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    JuceBridge.getLengthInSeconds().then(setLength);
    JuceBridge.isPlaying().then(setIsPlaying);
  }, [JuceBridge, position]);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Player</Text>
      <Text>
        Time: {position} / {length}
      </Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={length}
        value={position}
        step={0.1}
        onSlidingStart={() => {
          isDraggingRef.current = true;
        }}
        onValueChange={value => {
          JuceBridge.setPosition(value);
        }}
        onSlidingComplete={() => {
          isDraggingRef.current = false;
          JuceBridge.audioPlay();
        }}
      />

      <Text>Speed: {speed}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0.1}
        maximumValue={4}
        value={1}
        step={0.05}
        onValueChange={value => {
          setSpeed(value);
          JuceBridge.setResamplingRatio(value);
        }}
      />
      <Button title={isPlaying ? "Pause" : "Play"}
        onPress={() => {
          setIsPlaying(p => {
            if (!p) {
              JuceBridge.audioPlay()
            } else {
              JuceBridge.audioPause()
            }
            return !p;
          })
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1, padding: 20 },
  slider: { width: '100%', height: 40 },
});
