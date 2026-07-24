import {
  StyleSheet,
  useWindowDimensions,
  Image,
  View,
  Text,
  Pressable,
  NativeModules,
  TouchableOpacity,
} from 'react-native';
import { useContext, useState, useCallback, useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  convertToRGBA,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Slider from '@react-native-community/slider';

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  LucideAudioWaveform,
  LucideListPlus, LucideQuote,
} from 'lucide-react-native';
import { TodioCtx } from '../../App';
import { extractColors } from '../../utils/filesUtils';
import { Shadow } from 'react-native-shadow-2';
import Color from 'color';
import { useNavigation } from '@react-navigation/native';

const { JuceBridge } = NativeModules;

const TAB_BAR = 60;
const MINI_H = 72;
const DURATION = 350;

const formatTime = seconds => {
  const value = Number.isFinite(seconds) ? seconds : 0;
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
};

export default function Player() {
  const ctx = useContext(TodioCtx);
  const { playing, theme } = ctx;
  const navigation = useNavigation();

  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [full, setFull] = useState(false);
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(200);

  const [palette, setPalette] = useState();

  const progress = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const startTranslationY = useSharedValue(0);

  const positionInterval = useRef(null);

  const safePosition = Math.min(position || 0, duration || 0);

  const fullH = Math.max(height - insets.top, MINI_H);
  const dragRange = Math.max(fullH - MINI_H, 1);
  const artFullSize = Math.min(344, width - 48);
  const artFullTop = Math.max(40, fullH * 0.12);
  const textFullTop = artFullTop + artFullSize + 24;
  const fullControlsTop = fullH - 24 - 140;

  const loadData = useCallback(async () => {
    try {
      const currentPosition = await JuceBridge.getCurrentPosition();
      setPosition(Number.isFinite(currentPosition) ? currentPosition : 0);

      const playingState = await JuceBridge.isPlaying();
      setIsPlaying(!!playingState);

      const length = await JuceBridge.getLengthInSeconds();
      setDuration(Number.isFinite(length) && length > 0 ? length : 200);
    } catch (error) {
      console.error('Failed to load player data:', error);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      positionInterval.current = setInterval(async () => {
        try {
          const pos = await JuceBridge.getCurrentPosition();
          if (Number.isFinite(pos)) {
            setPosition(pos);
          }
        } catch (_) {}
      }, 100);
    } else {
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
        positionInterval.current = null;
      }
    }
    return () => {
      if (positionInterval.current) {
        clearInterval(positionInterval.current);
        positionInterval.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    loadData();
    playing?.artwork
      ? extractColors(playing.artwork).then(setPalette)
      : setPalette(undefined);
  }, [playing, loadData]);

  const toggleFull = useCallback(() => {
    const next = !full;
    setFull(next);
    progress.value = withTiming(next ? 1 : 0, { duration: DURATION });
  }, [full, progress]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      JuceBridge.audioPause();
      setIsPlaying(false);
    } else {
      JuceBridge.audioPlay();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback(value => {
    const seekTo = Number.isFinite(value) ? value : 0;
    JuceBridge.setPosition(seekTo);
    setPosition(seekTo);
  }, []);

  const skipForward = useCallback(() => {
    const newPos = Math.min(safePosition + 10, duration);
    handleSeek(newPos);
  }, [safePosition, duration, handleSeek]);

  const skipBack = useCallback(() => {
    const newPos = Math.max(safePosition - 10, 0);
    handleSeek(newPos);
  }, [safePosition, handleSeek]);

  const noop = useCallback(() => {}, []);

  const expandTap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((_e, success) => {
      'worklet';
      if (!success) return;
      scheduleOnRN(toggleFull);
    });

  const pan = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onStart(e => {
      'worklet';
      dragStart.value = progress.value;
      startTranslationY.value = e.translationY;
    })
    .onUpdate(e => {
      'worklet';
      const delta = -(e.translationY - startTranslationY.value) / dragRange;
      progress.value = Math.max(0, Math.min(1, dragStart.value + delta));
    })
    .onEnd(e => {
      'worklet';
      const shouldOpen =
        progress.value > (full ? 0.9 : 0.1) || e.velocityY < -500;
      progress.value = withTiming(shouldOpen ? 1 : 0, { duration: DURATION });
      scheduleOnRN(setFull, shouldOpen);
    });

  const expandGesture = Gesture.Race(expandTap, pan);

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [MINI_H, fullH]),
    width: width,
    paddingBottom: interpolate(progress.value, [0, 1], [0, insets.bottom]),
    bottom: interpolate(progress.value, [0, 1], [TAB_BAR, 0]),
    borderTopLeftRadius: interpolate(progress.value, [0, 1], [16, 0]),
    borderTopRightRadius: interpolate(progress.value, [0, 1], [16, 0]),
  }));

  const artStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    width: interpolate(progress.value, [0, 1], [48, artFullSize]),
    height: interpolate(progress.value, [0, 1], [48, artFullSize]),
    borderRadius: interpolate(progress.value, [0, 1], [8, 32]),
    left: interpolate(progress.value, [0, 1], [12, (width - artFullSize) / 2]),
    top: interpolate(progress.value, [0, 1], [12, artFullTop]),
  }));

  const textContainerStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: interpolate(progress.value, [0, 1], [0, textFullTop]),
    left: 0,
    width,
    paddingLeft: interpolate(progress.value, [0, 1], [72, 24]),
    paddingRight: interpolate(progress.value, [0, 1], [104, 24]),
    alignItems: progress.value > 0.5 ? 'center' : 'flex-start',
    justifyContent: 'center',
    height: interpolate(progress.value, [0, 1], [MINI_H, 120]),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(progress.value, [0, 1], [15, 22]),
    fontWeight: progress.value > 0.5 ? 'bold' : '600',
    textAlign: progress.value > 0.5 ? 'center' : 'left',
    width: '100%',
  }));

  const artistStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(progress.value, [0, 1], [13, 16]),
    textAlign: progress.value > 0.5 ? 'center' : 'left',
    width: '100%',
    marginTop: interpolate(progress.value, [0, 1], [2, 8]),
  }));

  const miniButtonsStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    right: 8,
    top: 0,
    height: MINI_H,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: interpolate(progress.value, [0, 0.2], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 0.2],
          [0, 12],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const fullControlsStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24 + insets.bottom,
    opacity: interpolate(progress.value, [0.7, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0.7, 1],
          [24, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const expandHitStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: interpolate(
      progress.value,
      [0, 1],
      [MINI_H, fullControlsTop],
      Extrapolation.CLAMP,
    ),
  }));

  if (!playing) return null;

  const artworkSource =
    playing?.artwork || playing?.cover || playing?.image
      ? { uri: playing.artwork || playing.cover || playing.image }
      : require('./fallback.png');

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        { backgroundColor: theme.surface },
      ]}
    >
      <Image
        source={artworkSource}
        style={styles.bg}
        resizeMode="cover"
        blurRadius={24}
        opacity={0.5}
      />

      <View
        pointerEvents="none"
        style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}
      />

      <Animated.Image
        source={artworkSource}
        style={[styles.art, artStyle, { backgroundColor: theme.border }]}
        resizeMode="cover"
      />

      <GestureDetector gesture={expandGesture}>
        <Animated.View style={expandHitStyle} />
      </GestureDetector>

      <Animated.View style={textContainerStyle} pointerEvents="none">
        <Animated.Text
          numberOfLines={1}
          style={[titleStyle, { color: theme.textPrimary }]}
        >
          {playing.name || 'Unknown title'}
        </Animated.Text>

        <Animated.Text
          numberOfLines={1}
          style={[artistStyle, { color: theme.textSecondary }]}
        >
          {playing.artist || 'Unknown artist'}
        </Animated.Text>
      </Animated.View>

      <Animated.View
        style={miniButtonsStyle}
        pointerEvents={full ? 'none' : 'box-none'}
      >
        <Pressable
          onPress={togglePlay}
          hitSlop={8}
          style={({ pressed }) => [
            styles.miniBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          {isPlaying ? (
            <Pause color={theme.textPrimary} size={24} />
          ) : (
            <Play color={theme.textPrimary} size={24} style={styles.playIcon} />
          )}
        </Pressable>

        <Pressable
          onPress={skipForward}
          hitSlop={8}
          style={({ pressed }) => [
            styles.miniBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <SkipForward color={theme.textPrimary} size={24} />
        </Pressable>
      </Animated.View>

      <Animated.View
        style={fullControlsStyle}
        pointerEvents={full ? 'box-none' : 'none'}
      >
        <View style={[styles.actionRow]}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={[
              styles.actionItem,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={() => {
              navigation.push('Effects');
            }}
          >
            <LucideAudioWaveform color={theme.textPrimary} size={24} />
            <Text style={[{ color: theme.textPrimary }]}>Effects</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            style={[
              styles.actionItem,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <LucideListPlus color={theme.textPrimary} size={24} />
            <Text style={[{ color: theme.textPrimary }]}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            style={[
              styles.actionItem,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <LucideQuote color={theme.textPrimary} size={24} />
            <Text style={[{ color: theme.textPrimary }]}>Lyrics</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeRow} pointerEvents="none">
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatTime(safePosition)}
          </Text>
          <Text style={[styles.timeText, { color: theme.textSecondary }]}>
            {formatTime(duration)}
          </Text>
        </View>

        <Slider
          style={styles.slider}
          value={safePosition}
          minimumValue={0}
          maximumValue={duration}
          step={0.1}
          onValueChange={setPosition}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor={
            palette?.vibrant ? palette.vibrant.color : theme.progressTrack
          }
          maximumTrackTintColor={
            palette?.vibrant ? palette.vibrant.color : theme.progressTrack
          }
          thumbTintColor={
            palette?.vibrant ? palette.vibrant.color : theme.progressTrack
          }
        />

        <View style={styles.controlsRow} pointerEvents="box-none">
          <Pressable
            onPress={noop}
            hitSlop={10}
            style={({ pressed }) => [
              styles.sideBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Shuffle
              color={theme.textSecondary}
              size={22}
              style={styles.softIcon}
            />
          </Pressable>

          <Pressable
            onPress={skipBack}
            hitSlop={10}
            style={({ pressed }) => [
              styles.sideBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <SkipBack color={theme.textPrimary} size={28} />
          </Pressable>

          <Shadow
            distance={25}
            startColor={
              palette?.vibrant
                ? Color(palette.vibrant.color).alpha(0.1).hexa()
                : theme.progressTrack
            }
            endColor={'#00000000'}
            paintInside={true}
          >
            <View
              style={{
                borderRadius: 50,
              }}
            >
              <Pressable
                onPress={togglePlay}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.playCircle,
                  {
                    backgroundColor: palette?.vibrant
                      ? palette.vibrant.color
                      : theme.accent,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                {isPlaying ? (
                  <Pause
                    color={
                      palette?.lightVibrant
                        ? palette.lightVibrant.color
                        : theme.accent
                    }
                    size={32}
                  />
                ) : (
                  <Play
                    color={
                      palette?.lightVibrant
                        ? palette.lightVibrant.color
                        : theme.accent
                    }
                    size={32}
                    style={styles.playIcon}
                  />
                )}
              </Pressable>
            </View>
          </Shadow>

          <Pressable
            onPress={skipForward}
            hitSlop={10}
            style={({ pressed }) => [
              styles.sideBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <SkipForward color={theme.textPrimary} size={28} />
          </Pressable>

          <Pressable
            onPress={noop}
            hitSlop={10}
            style={({ pressed }) => [
              styles.sideBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Repeat
              color={theme.textSecondary}
              size={22}
              style={styles.softIcon}
            />
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    overflow: 'hidden',
    zIndex: 1000,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  art: {
    borderRadius: 8,
    elevation: 8,
  },
  miniBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    marginLeft: 2,
  },
  softIcon: {
    opacity: 0.8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  slider: {
    width: '100%',
    height: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  actionRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    gap: 8
  },
  actionItem: {
    flexDirection: 'row',
    gap: 8,
    width: 'fit-content',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
});
