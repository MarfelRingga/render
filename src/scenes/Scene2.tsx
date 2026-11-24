import React from 'react';
import { Audio, Easing, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { COLORS } from '../theme';
import {
  CAPTION_DELAY_FRAMES,
  CAPTION_EXIT_MARGIN,
  FPS,
  getCueFrame,
  SceneDefinition,
  STAGGER_FRAMES,
} from '../timing';
import { Caption } from '../ui/Caption';
import { Label } from '../ui/Label';
import { Subtitle } from '../ui/Subtitle';
import { WorldState } from './Scene1';

export const evaluateScene2World = (
  localFrame: number,
  scene: SceneDefinition,
): WorldState => {
  const phoneEnterStart = getCueFrame(scene, 0.06);
  const acStart = getCueFrame(scene, 0.36);
  const fieldStart = getCueFrame(scene, 0.66);

  const phoneSpring = spring({
    frame: Math.max(0, localFrame - phoneEnterStart),
    fps: FPS,
    config: { damping: 16, stiffness: 85, mass: 1.1 },
  });

  const phoneY = interpolate(phoneSpring, [0, 1], [-14.0, -1.2]);

  const camProgress = interpolate(
    localFrame,
    [0, getCueFrame(scene, 0.45)],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

  const acStrength = interpolate(localFrame, [acStart, acStart + 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const fieldStrength = interpolate(localFrame, [fieldStart, fieldStart + 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return {
    cameraPos: [
      interpolate(camProgress, [0, 1], [2.8, 3.0]),
      interpolate(camProgress, [0, 1], [6.4, 6.2]),
      interpolate(camProgress, [0, 1], [14.6, 22.8]),
    ],
    cameraTarget: [0, interpolate(camProgress, [0, 1], [1.15, -0.35]), 0],
    cardPos: [0, 1.36, 0],
    cardRot: [
      interpolate(camProgress, [0, 1], [0.28, 0.04]),
      interpolate(camProgress, [0, 1], [-0.14, -0.05]),
      0,
    ],
    cardCutaway: 0,
    cardCoilEmissive: 0,
    cardCoilDim: 1,
    cardInducedStrength: 0,
    capacitorCharge: 0,
    chipPowered: false,
    chipPowerLevel: 0,
    loadModulation: 0,
    energyWarning: false,
    phonePos: [0, phoneY, 0],
    phoneRot: [0.02, -0.05, 0],
    phoneCoilEmissive: acStrength * 0.55,
    phoneCurrentStrength: acStrength,
    fieldStrength,
    fieldRipple: 0,
    dcRectifierStrength: 0,
    dcChipFeedStrength: 0,
    dataPulseStrength: 0,
    activeDataBit: 0,
    dataReceiveGlow: 0,
    rulerOpacity: 0,
  };
};

interface Scene2Props {
  scene: SceneDefinition;
}

export const Scene2: React.FC<Scene2Props> = ({ scene }) => {
  const localFrame = useCurrentFrame();
  const exitFrame = scene.durationInFrames - CAPTION_EXIT_MARGIN;
  const acCue = getCueFrame(scene, 0.38) + CAPTION_DELAY_FRAMES;
  const freqCue = getCueFrame(scene, 0.54) + CAPTION_DELAY_FRAMES;
  const fieldCue = getCueFrame(scene, 0.68) + CAPTION_DELAY_FRAMES;

  return (
    <>
      <Audio src={staticFile(scene.audioFile)} />
      <Caption
        text="Medan Magnet AC"
        localFrame={localFrame}
        enterFrame={acCue}
        exitFrame={exitFrame}
        accentColor={COLORS.FIELD}
      />
      <Label
        text="13,56 MHz (AC)"
        localFrame={localFrame}
        enterFrame={freqCue}
        exitFrame={exitFrame}
        x={76}
        y={430}
        accentColor={COLORS.CURRENT}
        mono
      />
      <Label
        text="1,5 Hz (disederhanakan)"
        localFrame={localFrame}
        enterFrame={fieldCue + STAGGER_FRAMES}
        exitFrame={exitFrame}
        x={76}
        y={510}
        accentColor={COLORS.FIELD}
        mono
      />
      <Subtitle scene={scene} localFrame={localFrame} />
    </>
  );
};
