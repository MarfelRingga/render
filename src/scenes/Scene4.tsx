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

const CHIP_THRESHOLD = 0.72;

export const evaluateScene4World = (
  localFrame: number,
  scene: SceneDefinition,
): WorldState => {
  const rectStart = getCueFrame(scene, 0.05);
  const capStart = getCueFrame(scene, 0.30);
  const capEnd = getCueFrame(scene, 0.72);

  const camProgress = interpolate(localFrame, [0, getCueFrame(scene, 0.35)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const dcRectifier = interpolate(localFrame, [rectStart, rectStart + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const capacitorCharge = interpolate(localFrame, [capStart, capEnd], [0.15, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  const chipPowered = capacitorCharge >= CHIP_THRESHOLD;
  const chipPowerLevel = interpolate(
    capacitorCharge,
    [CHIP_THRESHOLD, 1.0],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

  return {
    cameraPos: [
      interpolate(camProgress, [0, 1], [1.35, 2.35]),
      interpolate(camProgress, [0, 1], [10.6, 5.45]),
      interpolate(camProgress, [0, 1], [14.4, 5.25]),
    ],
    cameraTarget: [
      interpolate(camProgress, [0, 1], [0, 2.15]),
      interpolate(camProgress, [0, 1], [0.85, 1.4]),
      interpolate(camProgress, [0, 1], [0, 0.25]),
    ],
    cardPos: [0, 1.36, 0],
    cardRot: [0, 0, 0],
    cardCutaway: 1,
    cardCoilEmissive: 0.55,
    cardCoilDim: 1,
    cardInducedStrength: 1,
    capacitorCharge,
    chipPowered,
    chipPowerLevel,
    loadModulation: 0,
    energyWarning: false,
    phonePos: [0, -1.2, 0],
    phoneRot: [0, 0, 0],
    phoneCoilEmissive: 0.5,
    phoneCurrentStrength: 1,
    fieldStrength: interpolate(camProgress, [0, 1], [1, 0.75]),
    fieldRipple: 0,
    dcRectifierStrength: dcRectifier,
    dcChipFeedStrength: chipPowered ? chipPowerLevel : 0,
    dataPulseStrength: 0,
    activeDataBit: 0,
    dataReceiveGlow: 0,
    rulerOpacity: 0,
  };
};

interface Scene4Props {
  scene: SceneDefinition;
}

export const Scene4: React.FC<Scene4Props> = ({ scene }) => {
  const localFrame = useCurrentFrame();
  const state = evaluateScene4World(localFrame, scene);
  const exitFrame = scene.durationInFrames - CAPTION_EXIT_MARGIN;

  const rectCue = getCueFrame(scene, 0.06) + CAPTION_DELAY_FRAMES;
  const capCue = getCueFrame(scene, 0.34) + CAPTION_DELAY_FRAMES;
  const chipCue = getCueFrame(scene, 0.68) + CAPTION_DELAY_FRAMES;

  const capPercent = Math.round(state.capacitorCharge * 100);

  return (
    <>
      <Audio src={staticFile(scene.audioFile)} />
      <Caption
        text="Chip Menyala"
        localFrame={localFrame}
        enterFrame={chipCue}
        exitFrame={exitFrame}
        accentColor={COLORS.CURRENT}
      />
      <Label
        text="Penyearah AC → DC"
        localFrame={localFrame}
        enterFrame={rectCue}
        exitFrame={exitFrame}
        x={76}
        y={410}
        accentColor={COLORS.CURRENT}
      />
      <Label
        text={`Kapasitor: ${capPercent}%`}
        localFrame={localFrame}
        enterFrame={capCue + STAGGER_FRAMES}
        exitFrame={exitFrame}
        x={76}
        y={490}
        accentColor={state.chipPowered ? COLORS.CURRENT : COLORS.TEXT_SECONDARY}
        mono
      />
      <Subtitle scene={scene} localFrame={localFrame} />
    </>
  );
};
