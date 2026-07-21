import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { getAudioMetadata } from '@missingcore/audio-metadata';

export async function pickAudioFiles() {
  try {
    const results = await pick({
      type: [
        'audio/flac',
        'audio/wav',
        'audio/x-wav',
        'audio/mp3',
        'audio/mpeg',
        'audio/ogg',
        'audio/aiff',
        'audio/x-aiff',
      ],
      allowMultiSelection: true,
    });

    const musicDir = `${RNFS.DocumentDirectoryPath}/music`;

    if (!(await RNFS.exists(musicDir))) {
      await RNFS.mkdir(musicDir);
    }

    for (const file of results) {
      console.log(file.uri, file.name, file.size);

      const destPath = `${RNFS.DocumentDirectoryPath}/music/${file.name}`;
      await RNFS.copyFile(file.uri, destPath);
    }
  } catch (err) {
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
      console.log('User cancelled the picker');
    } else {
      console.error(err);
    }
  }
}

const AUDIO_EXTENSIONS = ['.flac', '.wav', '.mp3', '.ogg', '.aiff', '.aif'];

export async function listAudioFiles() {
  const musicDir = `${RNFS.DocumentDirectoryPath}/music`;

  try {
    const dirExists = await RNFS.exists(musicDir);
    if (!dirExists) {
      return [];
    }

    const entries = await RNFS.readDir(musicDir);

    const audioFiles = entries
      .filter(entry => {
        if (!entry.isFile()) return false;
        const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase();
        return AUDIO_EXTENSIONS.includes(ext);
      })
      .map(entry => ({
        name: entry.name,
        path: entry.path,
        size: entry.size,
        mtime: entry.mtime,
      }));

    return audioFiles;
  } catch (err) {
    console.error('Failed to list audio files:', err);
    return [];
  }
}

export async function getAudioArtwork(path) {
  try {
    const data = await getAudioMetadata(path, ['artwork']);
    return data.metadata.artwork || null; // already base64
  } catch (e) {
    console.log(e);
    return null;
  }
}
