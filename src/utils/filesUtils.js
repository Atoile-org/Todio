import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import * as RNFS from '@dr.pogodin/react-native-fs';

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

    for (const file of results) {
      console.log(file.uri, file.name, file.size);

      const destPath = `${RNFS.DocumentDirectoryPath}/${file.name}`;
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
