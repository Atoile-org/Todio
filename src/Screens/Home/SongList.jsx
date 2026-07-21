import {
  FlatList,
  Image,
  NativeModules,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Import, Music } from 'lucide-react-native/icons';
import { TodioCtx } from '../../App';
import { useContext, useEffect, useState } from 'react';
import {
  getAudioArtwork, getAudioMeta,
  listAudioFiles,
  pickAudioFiles,
} from '../../utils/filesUtils';
import {useNavigation} from "@react-navigation/native";

export default function SongList({ route }) {
  const { theme } = useContext(TodioCtx);
  const { JuceBridge } = NativeModules;
  const [songList, setSongList] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    listAudioFiles().then(async songs => {

      const withArt = await Promise.all(
        songs.map(async song => {
          const meta = await getAudioMeta(song.path);
          return {
            ...song,
            artwork: meta.artwork,
            artist: meta.artist,
        }}),
      );
      setSongList(withArt);
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.topText, { color: theme.textPrimary }]}>
          Song list
        </Text>
        <View style={styles.iconButton}>
          <Pressable
            style={styles.iconButtonInner}
            android_ripple={{ color: theme.accentMuted }}
            onPress={async () => {
              await pickAudioFiles();
            }}
          >
            <Import color={theme.textPrimary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={songList}
        keyExtractor={(song, index) =>
          song.id?.toString() ?? song.path ?? index.toString()
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => (
          <View
            style={[styles.separator, { backgroundColor: theme.accentMuted }]}
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textPrimary }]}>
            No songs yet. Tap the import icon to add some.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.songRow}
            activeOpacity={0.6}
            onPress={() => {
              JuceBridge.audioLoadFile(item.path);
              navigation.push("Player")
            }}
          >
            {item.artwork ? (
              <Image
                source={{ uri: item.artwork }}
                style={styles.songArtwork}
                resizeMode="cover"
              />
            ) : (
              <Music
                color={theme.textPrimary}
                size={20}
                style={styles.songIcon}
              />
            )}
            <View style={styles.songTextWrap}>
              <Text
                style={[styles.songTitle, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {item.name ?? item.title ?? 'Unknown title'}
              </Text>
              {item.artist || item.mtime ? (
                <Text
                  style={[
                    styles.songSubtitle,
                    { color: theme.textSecondary ?? theme.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {(item.artist ? item.artist : 'Unknow Artist') +
                    ' | ' +
                    item.mtime}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  topText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 'auto',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.3,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  songIcon: {
    marginRight: 12,
  },
  songTextWrap: {
    flex: 1,
    marginLeft: 8
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
});
