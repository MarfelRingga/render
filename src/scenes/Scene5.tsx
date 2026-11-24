import React from 'react';
import { Audio, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COLORS } from '../theme';
import {
  CAPTION_DELAY_FRAMES,
  CAPTION_EXIT_MARGIN,
  getCueFrame,
  SceneDefinition,
  STAGGER_FRAMES,
} from '../timing';
import { Caption } from '../ui/Caption';
import { Label } from '../ui/Label';
import { Subtitle } from '../ui/Subtitle';
import { WorldState } from './Scene1';

const LOAD_BITS = [1, 0, 1, 1, 0, 1] as const;

export const evaluateScene5World = (
  localFrame: number,
  scene: SceneDefinition,
): WorldState => {
  const modStart = getCueFrame(scene, 0.26);
  const modEnd = getCueFrame(scene, 0.94);

  const camProgress = interpolate(localFrame, [0, getCueFrame(scene, 0.42)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  let loadModulation = 0;
  let activeBit = 0;
  let decodedCount = 0;

  if (localFrame >= modStart && localFrame <= modEnd) {
    const span = Math.max(1, modEnd - modStart);
    const norm = (localFrame - modStart) / span;
    const bitFloat = norm * LOAD_BITS.length;
    const bitIdx = Math.min(LOAD_BITS.length - 1, Math.floor(bitFloat));
    const bitLocal = bitFloat - bitIdx;
    decodedCount = bitIdx + 1;
    activeBit = LOAD_BITS[bitIdx];

    if (activeBit === 1) {
      loadModulation = Math.sin(bitLocal * Math.PI);
    }
  } else if (localFrame > modEnd) {
    decodedCount = LOAD_BITS.length;
  }

  const dataActive = decodedCount > 0 ? 1 : 0;

  return {
    cameraPos: [
      interpolate(camProgress, [0, 1], [2.35, 14.6]),
      interpolate(camProgress, [0, 1], [5.45, 3.1]),
      interpolate(camProgress, [0, 1], [5.25, 16.2]),
    ],
    cameraTarget: [
      interpolate(camProgress, [0, 1], [2.15, 0.2]),
      interpolate(camProgress, [0, 1], [1.4, -0.1]),
      interpolate(camProgress, [0, 1], [0.25, 0.2]),
    ],
    cardPos: [0, 1.36, 0],
    cardRot: [0, 0, 0],
    cardCutaway: 1,
    cardCoilEmissive: 0.55,
    cardCoilDim: 1 - 0.68 * loadModulation,
    cardInducedStrength: 1 - 0.55 * loadModulation,
    capacitorCharge: 1,
    chipPowered: true,
    chipPowerLevel: 1,
    loadModulation,
    energyWarning: false,
    phonePos: [0, -1.2, 0],
    phoneRot: [0, 0, 0],
    phoneCoilEmissive: 0.55,
    phoneCurrentStrength: 1,
    fieldStrength: interpolate(camProgress, [0, 1], [0.75, 1]),
    fieldRipple: loadModulation,
    dcRectifierStrength: 1,
    dcChipFeedStrength: 1,
    dataPulseStrength: dataActive,
    activeDataBit: activeBit,
    dataReceiveGlow: loadModulation,
    rulerOpacity: 0,
  };
};

interface Scene5Props {
  scene: SceneDefinition;
}

export const Scene5: React.FC<Scene5Props> = ({ scene }) => {
  const localFrame = useCurrentFrame();
  const exitFrame = scene.durationInFrames - CAPTION_EXIT_MARGIN;
  const modStart = getCueFrame(scene, 0.26);
  const modEnd = getCueFrame(scene, 0.94);

  const modCue = modStart + CAPTION_DELAY_FRAMES;
  const dataCue = getCueFrame(scene, 0.54) + CAPTION_DELAY_FRAMES;

  const span = Math.max(1, modEnd - modStart);
  const decodedCount =
    localFrame < modStart
      ? 0
      : Math.min(
          LOAD_BITS.length,
          Math.floor(((localFrame - modStart) / span) * LOAD_BITS.length) + 1,
        );

  const visibleBits = LOAD_BITS.slice(0, decodedCount).join(' ');

  return (
    <>
      <Audio src={staticFile(scene.audioFile)} />
      <Caption
        text="Modulasi Beban"
        localFrame={localFrame}
        enterFrame={modCue}
        exitFrame={exitFrame}
        accentColor={COLORS.DATA}
      />
      <Label
        text="Riak Medan Pembaca"
        localFrame={localFrame}
        enterFrame={modCue + STAGGER_FRAMES}
        exitFrame={exitFrame}
        x={76}
        y={420}
        accentColor={COLORS.FIELD}
      />
      <Label
        text={`Data: ${visibleBits || '...'}`}
        localFrame={localFrame}
        enterFrame={dataCue}
        exitFrame={exitFrame}
        x={76}
        y={500}
        accentColor={COLORS.DATA}
        mono
      />
      <Subtitle scene={scene} localFrame={localFrame} />
    </>
  );
};
