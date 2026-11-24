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
import { PHONE_COIL_LOCAL_Y } from '../world/Phone';
import { WorldState } from './Scene1';

export const evaluateScene6World = (
  localFrame: number,
  scene: SceneDefinition,
): WorldState => {
  const pullApartStart = getCueFrame(scene, 0.14);
  const pullApartEnd = getCueFrame(scene, 0.68);

  const camProgress = interpolate(localFrame, [0, getCueFrame(scene, 0.48)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const sepProgress = interpolate(localFrame, [pullApartStart, pullApartEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const cardY = interpolate(sepProgress, [0, 1], [1.36, 5.8]);
  const phoneY = interpolate(sepProgress, [0, 1], [-1.2, -3.56]);
  const gapCm = cardY - (phoneY + PHONE_COIL_LOCAL_Y);

  // Magnetic dipole flux falls sharply with distance (~1 / (1 + (d/d0)^2.5))
  const decay = 1 / (1 + Math.pow(Math.max(0, gapCm - 2.2) / 2.0, 2.5));
  const capacitorCharge = Math.max(0.08, decay);
  const energyWarning = gapCm >= 4.2;

  const rulerOpacity = interpolate(localFrame, [10, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return {
    cameraPos: [
      interpolate(camProgress, [0, 1], [14.6, 1.8]),
      interpolate(camProgress, [0, 1], [3.1, 2.0]),
      interpolate(camProgress, [0, 1], [16.2, 26.8]),
    ],
    cameraTarget: [
      interpolate(camProgress, [0, 1], [0.2, -0.35]),
      interpolate(camProgress, [0, 1], [-0.1, 0.5]),
      0,
    ],
    cardPos: [0, cardY, 0],
    cardRot: [0, 0, 0],
    cardCutaway: 1,
    cardCoilEmissive: 0.55 * decay,
    cardCoilDim: 1,
    cardInducedStrength: decay,
    capacitorCharge,
    chipPowered: !energyWarning,
    chipPowerLevel: energyWarning ? 0 : decay,
    loadModulation: 0,
    energyWarning,
    phonePos: [0, phoneY, 0],
    phoneRot: [0, 0, 0],
    phoneCoilEmissive: 0.55,
    phoneCurrentStrength: 1,
    fieldStrength: 1,
    fieldRipple: 0,
    dcRectifierStrength: decay,
    dcChipFeedStrength: energyWarning ? 0 : decay,
    dataPulseStrength: 0,
    activeDataBit: 0,
    dataReceiveGlow: 0,
    rulerOpacity,
  };
};

interface CentimeterRulerProps {
  baseY: number;
  topY: number;
  opacity: number;
}

export const CentimeterRuler: React.FC<CentimeterRulerProps> = ({
  baseY,
  topY,
  opacity,
}) => {
  if (opacity <= 0.01) return null;

  const maxCm = 10;
  const activeHeight = Math.max(0.2, Math.min(maxCm, topY - baseY));

  return (
    <group position={[-5.1, baseY, 0]}>
      {/* Vertical ruler spine (10 cm tall) */}
      <mesh position={[0, maxCm / 2, 0]}>
        <boxGeometry args={[0.14, maxCm, 0.08]} />
        <meshStandardMaterial
          color={COLORS.RULER_BODY}
          metalness={0.35}
          roughness={0.55}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Active distance span indicator */}
      <mesh position={[0.16, activeHeight / 2, 0]}>
        <boxGeometry args={[0.08, activeHeight, 0.08]} />
        <meshStandardMaterial
          color={activeHeight >= 4.2 ? COLORS.WARNING : COLORS.DATA}
          emissive={activeHeight >= 4.2 ? COLORS.WARNING : COLORS.DATA}
          emissiveIntensity={0.6}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* 0 to 10 cm tick marks */}
      {Array.from({ length: maxCm + 1 }, (_, cm) => (
        <mesh key={cm} position={[cm % 5 === 0 ? 0.24 : 0.16, cm, 0]}>
          <boxGeometry args={[cm % 5 === 0 ? 0.36 : 0.2, 0.04, 0.08]} />
          <meshStandardMaterial
            color={COLORS.RULER_TICK}
            roughness={0.4}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  );
};

interface Scene6Props {
  scene: SceneDefinition;
}

export const Scene6: React.FC<Scene6Props> = ({ scene }) => {
  const localFrame = useCurrentFrame();
  const state = evaluateScene6World(localFrame, scene);
  const gapCm = state.cardPos[1] - (state.phonePos[1] + PHONE_COIL_LOCAL_Y);

  const limitCue = getCueFrame(scene, 0.08) + CAPTION_DELAY_FRAMES;
  const limitExit = getCueFrame(scene, 0.66);
  const followCue = getCueFrame(scene, 0.72) + CAPTION_DELAY_FRAMES;
  const finalExit = scene.durationInFrames - CAPTION_EXIT_MARGIN;

  return (
    <>
      <Audio src={staticFile(scene.audioFile)} />
      <Caption
        text="Batas Beberapa Cm"
        localFrame={localFrame}
        enterFrame={limitCue}
        exitFrame={limitExit}
        accentColor={COLORS.FIELD}
      />
      <Caption
        text="Follow Sains Harian"
        localFrame={localFrame}
        enterFrame={followCue}
        exitFrame={finalExit}
        accentColor={COLORS.DATA}
      />
      <Label
        text={`Jarak: ${gapCm.toFixed(1)} cm`}
        localFrame={localFrame}
        enterFrame={limitCue + STAGGER_FRAMES}
        exitFrame={finalExit}
        x={76}
        y={420}
        accentColor={state.energyWarning ? COLORS.WARNING : COLORS.DATA}
        mono
      />
      <Label
        text={state.energyWarning ? 'Energi Tidak Cukup' : 'Energi Cukup'}
        localFrame={localFrame}
        enterFrame={limitCue + STAGGER_FRAMES * 2}
        exitFrame={finalExit}
        x={76}
        y={500}
        accentColor={state.energyWarning ? COLORS.WARNING : COLORS.CURRENT}
      />
      <Subtitle scene={scene} localFrame={localFrame} />
    </>
  );
};
