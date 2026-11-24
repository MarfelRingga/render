export const FPS = 30;
export const SCENE_GAP_SEC = 0.3;

export const secToFrames = (seconds: number): number => Math.round(seconds * FPS);

export const STAGGER_FRAMES = 6;
export const CAPTION_DELAY_FRAMES = 8;
export const CAPTION_EXIT_MARGIN = secToFrames(0.45);
export const CAMERA_BLEND_FRAMES = secToFrames(0.95);
export const VISUAL_FIELD_HZ = 1.5;

export interface SceneDefinition {
  readonly id: 1 | 2 | 3 | 4 | 5 | 6;
  readonly audioFile: string;
  readonly audioDurationSec: number;
  readonly audioDurationInFrames: number;
  readonly durationInFrames: number;
  readonly startFrame: number;
  readonly endFrame: number;
  readonly phrases: readonly string[];
}

const RAW_SCENES: ReadonlyArray<{
  readonly id: 1 | 2 | 3 | 4 | 5 | 6;
  readonly audioFile: string;
  readonly audioDurationSec: number;
  readonly phrases: readonly string[];
}> = [
  {
    id: 1,
    audioFile: 'voice/scene1.wav',
    audioDurationSec: 5.16,
    phrases: [
      'Kartu NFC ini tidak punya baterai.',
      'Lalu, dari mana dia dapat listrik?',
    ],
  },
  {
    id: 2,
    audioFile: 'voice/scene2.wav',
    audioDurationSec: 14.36,
    phrases: [
      'Jawabannya ada di perangkat\nyang kamu tempelkan.',
      'Di dalam ponsel atau pembaca kartu,\nada kumparan yang dialiri',
      'arus bolak-balik,\ntiga belas koma lima enam megahertz.',
      'Arus itu menciptakan medan magnet\nyang terus berubah-ubah.',
    ],
  },
  {
    id: 3,
    audioFile: 'voice/scene3.wav',
    audioDurationSec: 11.08,
    phrases: [
      'Di dalam kartu, ada antena kecil\nberbentuk kumparan.',
      'Medan magnet yang berubah tadi\nmenembus kumparan itu,',
      'dan memunculkan listrik.',
      'Prinsipnya sama seperti transformator.',
    ],
  },
  {
    id: 4,
    audioFile: 'voice/scene4.wav',
    audioDurationSec: 8.88,
    phrases: [
      'Listrik bolak-balik itu disearahkan,',
      'lalu ditampung sebentar di kapasitor.',
      'Begitu cukup, chip kecil\ndi dalam kartu pun menyala.',
    ],
  },
  {
    id: 5,
    audioFile: 'voice/scene5.wav',
    audioDurationSec: 9.92,
    phrases: [
      'Setelah itu, chip membalas\ndengan cara unik.',
      'Dia sedikit mengubah beban\npada kumparannya,',
      'dan perubahan kecil itu terbaca\noleh pembaca kartu sebagai data.',
    ],
  },
  {
    id: 6,
    audioFile: 'voice/scene6.wav',
    audioDurationSec: 10.52,
    phrases: [
      'Karena itu, jaraknya\ncuma beberapa sentimeter.',
      'Makin jauh, medan magnetnya\nmakin lemah, dan energinya tidak cukup.',
      'Follow untuk sains teknologi\nsehari-hari lainnya.',
    ],
  },
];

let cursor = 0;
export const SCENES: readonly SceneDefinition[] = RAW_SCENES.map((raw) => {
  const audioDurationInFrames = secToFrames(raw.audioDurationSec);
  const durationInFrames = secToFrames(raw.audioDurationSec + SCENE_GAP_SEC);
  const startFrame = cursor;
  const endFrame = startFrame + durationInFrames;
  cursor = endFrame;
  return {
    id: raw.id,
    audioFile: raw.audioFile,
    audioDurationSec: raw.audioDurationSec,
    audioDurationInFrames,
    durationInFrames,
    startFrame,
    endFrame,
    phrases: raw.phrases,
  };
});

export const TOTAL_FRAMES: number = cursor;

export interface PhraseTiming {
  readonly text: string;
  readonly startFrame: number;
  readonly endFrame: number;
}

export const getScenePhraseTimings = (scene: SceneDefinition): readonly PhraseTiming[] => {
  const counts = scene.phrases.map((phrase) => phrase.replace(/\s+/g, '').length);
  const totalChars = counts.reduce((acc, c) => acc + c, 0);
  const availableFrames = scene.audioDurationInFrames;

  let frameCursor = 0;
  return scene.phrases.map((text, index) => {
    const isLast = index === scene.phrases.length - 1;
    const span = isLast
      ? availableFrames - frameCursor
      : Math.round((counts[index] / totalChars) * availableFrames);
    const startFrame = frameCursor;
    const endFrame = frameCursor + span;
    frameCursor = endFrame;
    return {
      text,
      startFrame,
      endFrame,
    };
  });
};

export const getSceneByFrame = (frame: number): { scene: SceneDefinition; localFrame: number } => {
  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    if (frame < s.endFrame) {
      return { scene: s, localFrame: Math.max(0, frame - s.startFrame) };
    }
  }
  const last = SCENES[SCENES.length - 1];
  return { scene: last, localFrame: last.durationInFrames - 1 };
};

export const getCueFrame = (scene: SceneDefinition, ratio: number): number => {
  return Math.round(scene.audioDurationInFrames * ratio);
};
