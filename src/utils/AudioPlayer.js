import { NativeEventEmitter, NativeModules } from 'react-native';

const { JuceBridge, JuceEvents } = NativeModules;

export const listeners = {
  onIndexChanged: null,
  onPlaylistChanged: null,
};

export let playlist = []
export let index = 0;

export function setup() {
  const eventEmitter = new NativeEventEmitter(JuceEvents);
  eventEmitter.addListener('JuceStateChange', event => {
    if (event.status === 'end') {
      next();
    }
  });
}

export function addSong(item, now = false) {
  if (now) {
    playlist.splice(index + 1, 0, item);
    next()
  } else {
    playlist.push(item);
  }
  listeners.onPlaylistChanged();
}

export function next() {
  index++;
  if (index === playlist.length) {
    index = 0;
  }
  JuceBridge.audioLoadFile(playlist[index].path);
  JuceBridge.audioPlay();
  listeners.onIndexChanged();
}

export function prev() {
  index--;
  if (index === -1) {
    index = playlist.length - 1;
  }
  JuceBridge.audioLoadFile(playlist[index].path);
  JuceBridge.audioPlay();
  listeners.onIndexChanged();
}

