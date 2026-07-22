import {
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ImageBackground,
  ToastAndroid,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated';
import { useContext, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TodioCtx } from '../App';
import { colors } from '../utils/themes';
import { PlatformPressable } from '@react-navigation/elements';
import Toast from 'react-native-toast-message';

export default function Player() {
  const { playing, theme } = useContext(TodioCtx)

  const [fullScreen, setFullScreen] = useState(false);

  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const sizeProgess = useSharedValue(0);

  useEffect(() => {
    Toast.show({
      text1: "Now playing: " + playing?.name,
      text2: JSON.stringify(playing),
      type: "info"
    })
  }, [playing]);

  const aStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(sizeProgess.value, [0, 1], [60, screenHeight]),
      bottom: interpolate(sizeProgess.value, [0, 1], [60, 0]),
      paddingTop: interpolate(sizeProgess.value, [0, 1], [0, insets.top]),
      paddingBottom: interpolate(sizeProgess.value, [0, 1], [0, insets.bottom]),
      backgroundColor: interpolateColor(
        sizeProgess.value,
        [0, 1],
        [theme.surface, '#fff'],
      ),
    };
  });

  return (
    playing && (
      <PlatformPressable
        onPress={() => {
          setFullScreen(p => {
            sizeProgess.value = withSpring(!p ? 1 : 0);
            return !p;
          });
        }}
      >
        <Animated.View style={[aStyle, styles.container]}>
          <ImageBackground
            source={playing?.artwork}
            style={styles.bgImage}
            resizeMode="cover"
            blurRadius={12}
          >
            <Text style={{ color: theme.textPrimary }}>Hello !</Text>
          </ImageBackground>
        </Animated.View>
      </PlatformPressable>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 60,
    width: '100%',
  },
  bgImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  text: { color: '#fff', fontSize: 20 },
});
