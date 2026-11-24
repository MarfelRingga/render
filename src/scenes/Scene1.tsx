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

export interface WorldState {
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  cardPos: [number, number, number];
  cardRot: [number, number, number];
  cardCutaway: number;
  cardCoilEmissive: number;
  cardCoilDim: number;
  cardInducedStrength: number;
  capacitorCharge: number;
  chipPowered: boolean;
  chipPowerLevel: number;
  loadModulation: number;
  energyWarning: boolean;
  phonePos: [number, number, number];
  phoneRot: [number, number, number];
  phoneCoilEmissive: number;
  phoneCurrentStrength: number;
  fieldStrength: number;
  fieldRipple: number;
  dcRectifierStrength: number;
  dcChipFeedStrength: number;
  dataPulseStrength: number;
  activeDataBit: number;
  dataReceiveGlow: number;
  rulerOpacity: number;
}

export const evaluateScene1World = (
  localFrame: number,
  scene: SceneDefinition,
): WorldState => {
  const t = Math.min(1, localFrame / Math.max(1, scene.durationInFrames - 1));
  const dolly = Easing.inOut(Easing.cubic)(t);

  return {
    cameraPos: [
      interpolate(dolly, [0, 1], [4.2, 2.8]),
      interpolate(dolly, [0, 1], [7.8, 6.4]),
      interpolate(dolly, [0, 1], [17.8, 14.6]),
    ],
    cameraTarget: [0, 1.15, 0],
    cardPos: [0, 1.36, 0],
    cardRot: [
      interpolate(dolly, [0, 1], [0.36, 0.28]),
      interpolate(dolly, [0, 1], [-0.26, -0.14]),
      0.05,
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
    phonePos: [0, -16, 0],
    phoneRot: [0, 0, 0],
    phoneCoilEmissive: 0,
    phoneCurrentStrength: 0,
    fieldStrength: 0,
    fieldRipple: 0,
    dcRectifierStrength: 0,
    dcChipFeedStrength: 0,
    dataPulseStrength: 0,
    activeDataBit: 0,
    dataReceiveGlow: 0,
    rulerOpacity: 0,
  };
};

interface Scene1Props {
  scene: SceneDefinition;
}

export const Scene1: React.FC<Scene1Props> = ({ scene }) => {
  const localFrame = useCurrentFrame();
  const exitFrame = scene.durationInFrames - CAPTION_EXIT_MARGIN;
  const batteryCue = getCueFrame(scene, 0.14) + CAPTION_DELAY_FRAMES;
  const questionCue = getCueFrame(scene, 0.52) + CAPTION_DELAY_FRAMES;

  return (
    <>
      <Audio src={staticFile(scene.audioFile)} />
      <Caption
        text="Tanpa Baterai"
        localFrame={localFrame}
        enterFrame={batteryCue}
        exitFrame={exitFrame}
        accentColor={COLORS.WARNING}
      />
      <Label
        text="0 mAh · Pasif"
        localFrame={localFrame}
        enterFrame={batteryCue + STAGGER_FRAMES}
        exitFrame={exitFrame}
        x={76}
        y={520}
        accentColor={COLORS.WARNING}
        mono
        icon="no-battery"
      />
      <Label
        text="Sumber Daya: ?"
        localFrame={localFrame}
        enterFrame={questionCue}
        exitFrame={exitFrame}
        x={76}
        y={600}
        accentColor={COLORS.CURRENT}
      />
      <Subtitle scene={scene} localFrame={localFrame} />
    </>
  );
};
