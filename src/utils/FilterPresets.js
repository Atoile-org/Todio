export const DEFAULT_PRESETS = [
  {
    name: 'None',
    speed: 1,
    reverb: {
      enable: false,
    },
    hpf: {
      enable: false,
    },
    lpf: {
      enable: false,
    },
  },
  {
    name: 'DayCore',
    speed: 0.7,
    reverb: {
      enable: false,
    },
    hpf: {
      enable: false,
    },
    lpf: {
      enable: false,
    },
  },
  {
    name: 'DuskCore',
    speed: 0.8,
    reverb: {
      enable: false,
    },
    hpf: {
      enable: false,
    },
    lpf: {
      enable: false,
    },
  },
  {
    name: 'EveningCore',
    speed: 1.2,
    reverb: {
      enable: false,
    },
    hpf: {
      enable: false,
    },
    lpf: {
      enable: false,
    },
  },
  {
    name: 'NightCore',
    speed: 1.3,
    reverb: {
      enable: false,
    },
    hpf: {
      enable: false,
    },
    lpf: {
      enable: false,
    },
  },
  {
    name: 'FogCore',
    speed: 0.7,
    reverb: {
      enable: true,
      roomSize: 0.5,
      damping: 0.85,
      wetLevel: 0.7,
      dryLevel: 0.25,
      width: 1.0,
      freezeMode: 0,
    },
    hpf: {
      enable: true,
      frequency: 150,
      resonance: 0.7,
    },
    lpf: {
      enable: true,
      frequency: 12500,
      resonance: 0.35,
    },
  },
  {
    name: 'CaveCore',
    speed: 0.8,
    reverb: {
      enable: true,
      roomSize: 0.85,
      damping: 0.6,
      wetLevel: 0.5,
      dryLevel: 0.3,
      width: 0.2,
      freezeMode: 0,
    },
    hpf: {
      enable: true,
      frequency: 80,
      resonance: 0.3,
    },
    lpf: {
      enable: false,
    },
  },
];