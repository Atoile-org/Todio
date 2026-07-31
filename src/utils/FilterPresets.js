export const DEFAULT_PRESETS = [
  {
    name: 'DayCore',
    speed: 0.7,
    reverb: {
      enable: false,
    },
  },
  {
    name: 'DuskCore',
    speed: 0.8,
    reverb: {
      enable: false,
    },
  },
  {
    name: 'EveningCore',
    speed: 1.2,
    reverb: {
      enable: false,
    },
  },
  {
    name: 'NightCore',
    speed: 1.3,
    reverb: {
      enable: false,
    },
  },
  {
    name: 'FogCore',
    speed: 0.8,
    reverb: {
      enable: true,
      roomSize: 0.5,
      damping: 0.85,
      wetLevel: 0.55,
      dryLevel: 0.25,
      width: 1.0,
      freezeMode: 0,
    },
  },
  {
    name: 'CaveCore',
    speed: 0.8,
    reverb: {
      enable: true,
      roomSize: 0.85,
      damping: 0.25,
      wetLevel: 0.5,
      dryLevel: 0.3,
      width: 0.4,
      freezeMode: 0,
    },
  },
];