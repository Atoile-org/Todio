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
  getAudioMeta,
  listAudioFiles,
  pickAudioFiles,
} from '../../utils/filesUtils';
import {useNavigation} from "@react-navigation/native";
import SongDisplay from '../../components/SongDisplay';

export default function SongList({ route }) {
  const { theme, setPlaying, setPlayList } = useContext(TodioCtx);
  const { JuceBridge } = NativeModules;
  const [songList, setSongList] = useState([]);

  const [selected, setSelected] = useState();

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
            name: meta.name,
            year: meta.year,
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
        renderItem={({ item, index }) => (
          <SongDisplay
            item={item}
            index={index}
            selected={selected}
            setSelected={setSelected}
            setPlayList={setPlayList}
          />
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
    paddingHorizontal: 0,
    paddingBottom: 24,
    flexGrow: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.3,
  },
});
