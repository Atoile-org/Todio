import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Import } from 'lucide-react-native/icons';
import { TodioCtx } from '../../App';
import { useContext } from 'react';
import {pickAudioFiles} from "../../utils/filesUtils";

export default function SongList({ route }) {
  const { theme } = useContext(TodioCtx);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.topText, { color: theme.textPrimary }]}>
          Song list
        </Text>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <Pressable
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            android_ripple={{ color: theme.accentMuted }}
            onPress={async () => {
                console.log(await pickAudioFiles());
            }}
          >
            <Import color={theme.textPrimary} />
          </Pressable>
        </View>
      </View>
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
});
