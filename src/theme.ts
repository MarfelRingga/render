import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

const spaceGrotesk = loadSpaceGrotesk('normal', {
  weights: ['500', '700'],
  subsets: ['latin'],
});

const jetBrainsMono = loadJetBrainsMono('normal', {
  weights: ['500', '700'],
  subsets: ['latin'],
});

export const FONTS = {
  sans: spaceGrotesk.fontFamily,
  mono: jetBrainsMono.fontFamily,
} as const;

export const FONT_SIZE = {
  TITLE: 96,
  LABEL: 48,
  SUBTITLE: 52,
} as const;

export const COLORS = {
  BG_TOP: '#0B0F14',
  BG_MID: '#0D141B',
  BG_BOTTOM: '#101820',
  BG_GRADIENT: 'linear-gradient(180deg, #0B0F14 0%, #0D141B 58%, #101820 100%)',

  FIELD: '#3DA5FF',
  CURRENT: '#FFB020',
  DATA: '#5CE0B8',
  WARNING: '#FF5A4D',

  TEXT_PRIMARY: '#F2F5F8',
  TEXT_SECONDARY: '#8A97A6',

  CARD_BODY: '#1D242E',
  CARD_EDGE: '#2A3340',
  CARD_SUBSTRATE: '#131820',
  CARD_ACCENT: '#2C3644',

  PHONE_CHASSIS: '#181E26',
  PHONE_FRAME: '#2D3642',
  PHONE_BACK_GLASS: '#11161D',
  PHONE_CAMERA_RING: '#252D38',
  PHONE_LENS: '#0A0D12',

  COPPER_WIRE: '#C47D3B',
  SILICON_DIE: '#1B212B',
  SILICON_PAD: '#B8C2CE',
  CAPACITOR_BODY: '#28313D',
  CAPACITOR_BAND: '#3D4856',
  RULER_BODY: '#1B222C',
  RULER_TICK: '#8A97A6',

  KEY_LIGHT: '#FFF4E6',
  RIM_LIGHT: '#8AC2FF',
  HEMI_SKY: '#A5C4E0',
  HEMI_GROUND: '#0E141B',

  OVERLAY_SCRIM: 'rgba(11, 15, 20, 0.88)',
  OVERLAY_BORDER: 'rgba(138, 151, 166, 0.24)',
} as const;

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;

export const SAFE_AREA = {
  TOP: 150,
  BOTTOM: 230,
  LEFT: 64,
  RIGHT: 96,
  SUBTITLE_BOTTOM: Math.round(VIDEO_HEIGHT * 0.25),
} as const;
