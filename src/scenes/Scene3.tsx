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

export const evaluateScene3World = (
  localFrame: number,
  scene: SceneDefinition,
): WorldState => {
  const cutawayEnd = getCueFrame(scene, 0.34);
  const induceStart = getCueFrame(scene, 0.48);

  const camProgress = interpolate(localFrame, [0, getCueFrame(scene, 0.55)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const cutaway = interpolate(localFrame, [6, cutawayEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const induced = interpolate(localFrame, [induceStart, induceStart + 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return {
    cameraPos: [
      interpolate(camProgress, [0, 1], [3.0, 1.35]),
      interpolate(camProgress, [0, 1], [6.2, 10.6]),
      interpolate(camProgress, [0, 1], [22.8, 14.4]),
    ],
    cameraTarget: [0, interpolate(camProgress, [0, 1], [-0.35, 0.85]), 0],
    cardPos: [0, 1.36, 0],
    cardRot: [
      interpolate(camProgress, [0, 1], [0.04, 0]),
      interpolate(camProgress, [0, 1], [-0.05, 0]),
      0,
    ],
    cardCutaway: cutaway,
    cardCoilEmissive: induced * 0.55,
    cardCoilDim: 1,
    cardInducedStrength: induced,
    capacitorCharge: induced * 0.15,
    chipPowered: false,
    chipPowerLevel: 0,
    loadModulation: 0,
    energyWarning: false,
    phonePos: [0, -1.2, 0],
    phoneRot: [
      interpolate(camProgress, [0, 1], [0.02, 0]),
      interpolate(camProgress, [0, 1], [-0.05, 0]),
      0,
    ],
    phoneCoilEmissive: 0.55,
    phoneCurrentStrength: 1,
    fieldStrength: 1,
    fieldRipple: 0,
    dcRectifierStrength: 0,
    dcChipFeedStrength: 0,
    dataPulseStrength: 0,
    activeDataBit: 0,
    dataReceiveGlow: 0,
    rulerOpacity: 0,
  };
};

interface Scene3Props {
  scene: SceneDefinition;
}

export const Scene3: React.FC<Scene3Props> = ({ scene }) => {
  const localFrame = useCurrentFrame();
  const exitFrame = scene.durationInFrames - CAPTION_EXIT_MARGIN;
  const coilCue = getCueFrame(scene, 0.08) + CAPTION_DELAY_FRAMES;
  const induceCue = getCueFrame(scene, 0.48) + CAPTION_DELAY_FRAMES;
  const transformerCue = getCueFrame(scene, 0.66) + CAPTION_DELAY_FRAMES;

  return (
    <>
      <Audio src={staticFile(scene.audioFile)} />
      <Caption
        text="Induksi Transformator"
        localFrame={localFrame}
        enterFrame={transformerCue}
        exitFrame={exitFrame}
        accentColor={COLORS.CURRENT}
      />
      <Label
        text="Kumparan Sekunder"
        localFrame={localFrame}
        enterFrame={coilCue}
        exitFrame={exitFrame}
        x={76}
        y={420}
        accentColor={COLORS.TEXT_PRIMARY}
      />
      <Label
        text="Arus Induksi AC"
        localFrame={localFrame}
        enterFrame={induceCue + STAGGER_FRAMES}
        exitFrame={exitFrame}
        x={76}
        y={500}
        accentColor={COLORS.CURRENT}
      />
      <Subtitle scene={scene} localFrame={localFrame} />
    </>
  );
};
