import {
  Image,
  NativeModules, StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  LucideListChecks,
  LucideListEnd,
  LucideListMusic,
  LucideListPlus,
  LucideListStart,
  LucideListTree,
  LucideListVideo,
  LucideListX,
  LucidePlay,
  Music,
} from 'lucide-react-native';
import { useContext, useEffect, useState } from 'react';
import { TodioCtx } from '../App';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { extractColors } from '../utils/filesUtils';

export default function SongDisplay({ item, index, selected, setSelected, setPlayList }) {
  const { JuceBridge } = NativeModules;
  const { playing, setPlaying, theme } = useContext(TodioCtx);

  const progress = useSharedValue(0);

  const [devlopped, setDevlopped] = useState(false);
  const [actionRowPalette, setActionRowPalette] = useState();

  const animatedContainer = useAnimatedStyle(() => {
    return {
      height: interpolate(progress.value, [0, 1], [60, 60 * 2]),
    };
  });

  const animatedBackground = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 0.5]),
    };
  });

  const animatedButton = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [0.5, 1]),
        },
      ],
    };
  });

  useEffect(() => {
    if (devlopped && item.artwork && actionRowPalette === undefined) {
      extractColors(item.artwork).then(setActionRowPalette);
    }
  }, [devlopped]);

  useEffect(() => {
    if (selected !== index && devlopped) {
      progress.value = withSpring(0);
      setDevlopped(false);
    }
  }, [selected]);

  return (
    <Animated.View style={[animatedContainer, styles.root]}>
      <Animated.Image
        source={{ uri: item.artwork }}
        style={[styles.bg, animatedBackground]}
        blurRadius={24}
        resizeMode={'cover'}
      />

      <TouchableOpacity
        style={[styles.songRow]}
        activeOpacity={0.6}
        onPress={() => {
          const next = !devlopped;
          progress.value = withSpring(next ? 1 : 0);
          setDevlopped(next);
          setSelected(index);
        }}
      >
        {item.artwork ? (
          <Image
            source={{ uri: item.artwork }}
            style={styles.songArtwork}
            resizeMode="cover"
          />
        ) : (
          <Music color={theme.textPrimary} size={20} style={styles.songIcon} />
        )}
        <View style={styles.songTextWrap}>
          <Text
            style={[styles.songTitle, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {item.name ?? item.title ?? 'Unknown title'}
          </Text>
          {item.artist || item.mtime || item.year ? (
            <Text
              style={[
                styles.songSubtitle,
                { color: theme.textSecondary ?? theme.textPrimary },
              ]}
              numberOfLines={1}
            >
              {(item.artist ? item.artist : 'Unknow Artist') +
                ' | ' +
                (item.year ? item.year : item.mtime)}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity>
          <Animated.View style={animatedButton}>
            <LucideListPlus
              style={styles.actionButton}
              color={actionRowPalette?.lightVibrant.color || theme.textPrimary}
              size={30}
            />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setPlaying(item);
            JuceBridge.audioLoadFile(item.path);
            JuceBridge.audioPlay();
          }}
        >
          <Animated.View style={animatedButton}>
            <LucidePlay
              style={styles.actionButton}
              color={actionRowPalette?.lightVibrant.color || theme.textPrimary}
              size={30}
            />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setPlayList(p => [...p, item]);
          }}
        >
          <Animated.View style={animatedButton}>
            <LucideListEnd
              style={styles.actionButton}
              color={actionRowPalette?.lightVibrant.color || theme.textPrimary}
              size={30}
            />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            JuceBridge.audioLoadFile(item.path);
            JuceBridge.audioPlay();
            setPlayList(p => [item, ...p]);
            setPlaying(item);
          }}
        >
          <Animated.View style={animatedButton}>
            <LucideListStart
              style={styles.actionButton}
              color={actionRowPalette?.lightVibrant?.color || theme.textPrimary}
              size={30}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  songIcon: {
    marginRight: 12,
  },
  songTextWrap: {
    flex: 1,
    marginLeft: 8,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  songSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.6,
  },
  songArtwork: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 48
  },
  actionButton: {
    paddingLeft: 12,
  },
});
