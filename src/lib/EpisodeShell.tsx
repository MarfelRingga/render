import React, { createContext, useContext, useMemo } from 'react';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const spaceGrotesk = loadSpaceGrotesk('normal', {
  weights: ['500', '700'],
  subsets: ['latin'],
});

const jetBrainsMono = loadJetBrainsMono('normal', {
  weights: ['500', '700'],
  subsets: ['latin'],
});

export const theme = {
  bg: '#080B10',
  bgMid: '#0D131B',
  bgGlow: '#131D29',
  surface: '#283342',
  surfaceLight: '#46566B',
  field: '#3DA5FF',
  current: '#FFB020',
  data: '#5CE0B8',
  danger: '#FF5A4D',
  text: '#F2F5F8',
  textMuted: '#8A97A6',
} as const;

export const fonts = {
  sans: spaceGrotesk.fontFamily,
  mono: jetBrainsMono.fontFamily,
} as const;

export const type = {
  title: 96,
  label: 48,
  subtitle: 52,
} as const;

export const safe = {
  top: 140,
  bottom: 220,
  side: 90,
} as const;

export interface SceneMeta {
  readonly id: number;
  readonly text: string;
  readonly subtitle: readonly string[];
  readonly seconds: number;
  readonly speechFrames: number;
  readonly startFrame: number;
  readonly frames: number;
  readonly audioFile: string;
}

export interface TimingInfo {
  readonly fps: number;
  readonly totalFrames: number;
  readonly scenes: readonly SceneMeta[];
}

export interface SceneState extends SceneMeta {
  readonly local: number;
  readonly progress: number;
  readonly speech: number;
  readonly active: boolean;
}

const FPS = 30;
const END_PAUSE_SEC = 0.3;

const RAW_SCENES = [
  {
    id: 1,
    audioFile: 'voice/scene1.wav',
    seconds: 5.16,
    text: 'Kartu NFC ini tidak punya baterai. Lalu, dari mana dia dapat listrik?',
    subtitle: [
      'Kartu NFC ini tidak punya baterai.',
      'Lalu, dari mana dia dapat listrik?',
    ],
  },
  {
    id: 2,
    audioFile: 'voice/scene2.wav',
    seconds: 14.36,
    text: 'Jawabannya ada di perangkat yang kamu tempelkan. Di dalam ponsel atau pembaca kartu, ada kumparan yang dialiri arus bolak-balik, tiga belas koma lima enam megahertz. Arus itu menciptakan medan magnet yang terus berubah-ubah.',
    subtitle: [
      'Jawabannya ada di perangkat\nyang kamu tempelkan.',
      'Di dalam ponsel atau pembaca kartu,\nada kumparan yang dialiri',
      'arus bolak-balik,\ntiga belas koma lima enam megahertz.',
      'Arus itu menciptakan medan magnet\nyang terus berubah-ubah.',
    ],
  },
  {
    id: 3,
    audioFile: 'voice/scene3.wav',
    seconds: 11.08,
    text: 'Di dalam kartu, ada antena kecil berbentuk kumparan. Medan magnet yang berubah tadi menembus kumparan itu, dan memunculkan listrik. Prinsipnya sama seperti transformator.',
    subtitle: [
      'Di dalam kartu, ada antena kecil\nberbentuk kumparan.',
      'Medan magnet yang berubah tadi\nmenembus kumparan itu,',
      'dan memunculkan listrik.',
      'Prinsipnya sama seperti transformator.',
    ],
  },
  {
    id: 4,
    audioFile: 'voice/scene4.wav',
    seconds: 8.88,
    text: 'Listrik bolak-balik itu disearahkan, lalu ditampung sebentar di kapasitor. Begitu cukup, chip kecil di dalam kartu pun menyala.',
    subtitle: [
      'Listrik bolak-balik itu disearahkan,',
      'lalu ditampung sebentar di kapasitor.',
      'Begitu cukup, chip kecil\ndi dalam kartu pun menyala.',
    ],
  },
  {
    id: 5,
    audioFile: 'voice/scene5.wav',
    seconds: 9.92,
    text: 'Setelah itu, chip membalas dengan cara unik. Dia sedikit mengubah beban pada kumparannya, dan perubahan kecil itu terbaca oleh pembaca kartu sebagai data.',
    subtitle: [
      'Setelah itu, chip membalas\ndengan cara unik.',
      'Dia sedikit mengubah beban\npada kumparannya,',
      'dan perubahan kecil itu terbaca\noleh pembaca kartu sebagai data.',
    ],
  },
  {
    id: 6,
    audioFile: 'voice/scene6.wav',
    seconds: 10.52,
    text: 'Karena itu, jaraknya cuma beberapa sentimeter. Makin jauh, medan magnetnya makin lemah, dan energinya tidak cukup. Follow untuk sains teknologi sehari-hari lainnya.',
    subtitle: [
      'Karena itu, jaraknya\ncuma beberapa sentimeter.',
      'Makin jauh, medan magnetnya\nmakin lemah, dan energinya tidak cukup.',
      'Follow untuk sains teknologi\nsehari-hari lainnya.',
    ],
  },
] as const;

let frameCursor = 0;
const SCENES: readonly SceneMeta[] = RAW_SCENES.map((raw) => {
  const speechFrames = Math.round(raw.seconds * FPS);
  const frames = Math.round((raw.seconds + END_PAUSE_SEC) * FPS);
  const startFrame = frameCursor;
  frameCursor += frames;
  return {
    id: raw.id,
    text: raw.text,
    subtitle: raw.subtitle,
    seconds: raw.seconds,
    speechFrames,
    startFrame,
    frames,
    audioFile: raw.audioFile,
  };
});

export const TOTAL_EPISODE_FRAMES = frameCursor;
export const EPISODE_FPS = FPS;

const DEFAULT_TIMING: TimingInfo = {
  fps: FPS,
  totalFrames: TOTAL_EPISODE_FRAMES,
  scenes: SCENES,
};

const TimingContext = createContext<TimingInfo>(DEFAULT_TIMING);

export const useTiming = (): TimingInfo => {
  return useContext(TimingContext);
};

export const useScene = (index: number): SceneState => {
  const timing = useTiming();
  const globalFrame = useCurrentFrame();
  const meta = timing.scenes[index] ?? timing.scenes[timing.scenes.length - 1];
  const rawLocal = globalFrame - meta.startFrame;
  const active = rawLocal >= 0 && rawLocal < meta.frames;
  const local = Math.max(0, Math.min(meta.frames - 1, rawLocal));
  const progress = Math.max(0, Math.min(1, local / Math.max(1, meta.frames - 1)));
  const speech = Math.max(0, Math.min(1, local / Math.max(1, meta.speechFrames - 1)));

  return {
    ...meta,
    local,
    progress,
    speech,
    active,
  };
};

const ShellSubtitle: React.FC<{ scene: SceneMeta }> = ({ scene }) => {
  const globalFrame = useCurrentFrame();
  const local = globalFrame - scene.startFrame;
  if (local < 0 || local >= scene.speechFrames) {
    return null;
  }

  const charCounts = scene.subtitle.map((p) => p.replace(/\s+/g, '').length);
  const totalChars = charCounts.reduce((a, b) => a + b, 0);

  let cursor = 0;
  let activePhrase: { text: string; start: number; end: number } | null = null;
  for (let i = 0; i < scene.subtitle.length; i++) {
    const isLast = i === scene.subtitle.length - 1;
    const span = isLast
      ? scene.speechFrames - cursor
      : Math.round((charCounts[i] / totalChars) * scene.speechFrames);
    const start = cursor;
    const end = cursor + span;
    cursor = end;
    if (local >= start && local < end) {
      activePhrase = { text: scene.subtitle[i], start, end };
      break;
    }
  }

  if (!activePhrase) return null;

  const fadeIn = interpolate(local, [activePhrase.start, activePhrase.start + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const fadeOut = interpolate(local, [activePhrase.end - 4, activePhrase.end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });
  const opacity = Math.min(fadeIn, fadeOut);
  const translateY = interpolate(fadeIn, [0, 1], [8, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: Math.round(1920 * 0.23),
        left: safe.side,
        right: safe.side,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(8, 11, 16, 0.88)',
          border: '1px solid rgba(138, 151, 166, 0.24)',
          borderRadius: 6,
          padding: '16px 28px',
          fontFamily: fonts.sans,
          fontSize: type.subtitle,
          fontWeight: 500,
          lineHeight: 1.24,
          color: theme.text,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {activePhrase.text}
      </div>
    </div>
  );
};

export const EpisodeShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const timing = useMemo(() => DEFAULT_TIMING, []);

  return (
    <TimingContext.Provider value={timing}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, ${theme.bgGlow} 0%, ${theme.bgMid} 54%, ${theme.bg} 100%)`,
        }}
      >
        {children}

        {timing.scenes.map((scene) => (
          <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.frames}>
            <Audio src={staticFile(scene.audioFile)} />
            <ShellSubtitle scene={scene} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </TimingContext.Provider>
  );
};
