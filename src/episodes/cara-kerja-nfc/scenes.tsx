import React from 'react';
import { Easing, interpolate, spring } from 'remotion';
import { SceneState, theme, useScene, useTiming } from '../../lib/EpisodeShell';
import { ScreenLabel, ScreenTitle } from './OverlayText';
import { PHONE_COIL_LOCAL_Y } from './Phone';

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

export const CUE = {
  s1Battery: 0.14,
  s1Question: 0.52,

  s2PhoneEnter: 0.06,
  s2AcStart: 0.36,
  s2FreqLabel: 0.54,
  s2FieldPulse: 0.66,

  s3CutawayStart: 0.05,
  s3CutawayEnd: 0.34,
  s3Induce: 0.48,
  s3Transformer: 0.66,

  s4Rectify: 0.05,
  s4CapStart: 0.30,
  s4CapEnd: 0.72,
  s4ChipOn: 0.68,

  s5ModStart: 0.26,
  s5DataLabel: 0.54,
  s5ModEnd: 0.94,

  s6LimitLabel: 0.08,
  s6PullStart: 0.14,
  s6PullEnd: 0.68,
  s6Follow: 0.72,
} as const;

const CHIP_THRESHOLD = 0.72;
const LOAD_BITS = [1, 0, 1, 1, 0, 1] as const;

export const evaluateScene1 = (s: SceneState): WorldState => {
  const dolly = Easing.inOut(Easing.cubic)(s.progress);
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
      interpolate(dolly, [0, 1], [0.05, 0]),
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
    phonePos: [0, -14.0, 0],
    phoneRot: [0.02, -0.05, 0],
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

export const evaluateScene2 = (s: SceneState, fps: number): WorldState => {
  const phoneStartFrame = Math.round(CUE.s2PhoneEnter * s.speechFrames);
  const phoneSpring = spring({
    frame: Math.max(0, s.local - phoneStartFrame),
    fps,
    config: { damping: 16, stiffness: 85, mass: 1.1 },
  });

  const phoneY = interpolate(phoneSpring, [0, 1], [-14.0, -1.2]);

  const camProgress = interpolate(s.speech, [0, 0.45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const acStrength = interpolate(s.speech, [CUE.s2AcStart, CUE.s2AcStart + 0.08], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const fieldStrength = interpolate(
    s.speech,
    [CUE.s2FieldPulse, CUE.s2FieldPulse + 0.1],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    },
  );

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

export const evaluateScene3 = (s: SceneState): WorldState => {
  const camProgress = interpolate(s.speech, [0, 0.55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const cutaway = interpolate(s.speech, [CUE.s3CutawayStart, CUE.s3CutawayEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const induced = interpolate(s.speech, [CUE.s3Induce, CUE.s3Induce + 0.14], [0, 1], {
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

export const evaluateScene4 = (s: SceneState): WorldState => {
  const camProgress = interpolate(s.speech, [0, 0.35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const dcRectifier = interpolate(s.speech, [CUE.s4Rectify, CUE.s4Rectify + 0.12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const capacitorCharge = interpolate(s.speech, [CUE.s4CapStart, CUE.s4CapEnd], [0.15, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  const chipPowered = capacitorCharge >= CHIP_THRESHOLD;
  const chipPowerLevel = interpolate(capacitorCharge, [CHIP_THRESHOLD, 1.0], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

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

export const evaluateScene5 = (s: SceneState): WorldState => {
  const camProgress = interpolate(s.speech, [0, 0.42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  let loadModulation = 0;
  let activeBit = 0;
  let decodedCount = 0;

  if (s.speech >= CUE.s5ModStart && s.speech <= CUE.s5ModEnd) {
    const norm = (s.speech - CUE.s5ModStart) / (CUE.s5ModEnd - CUE.s5ModStart);
    const bitFloat = norm * LOAD_BITS.length;
    const bitIdx = Math.min(LOAD_BITS.length - 1, Math.floor(bitFloat));
    const bitLocal = bitFloat - bitIdx;
    decodedCount = bitIdx + 1;
    activeBit = LOAD_BITS[bitIdx];
    if (activeBit === 1) {
      loadModulation = Math.sin(bitLocal * Math.PI);
    }
  } else if (s.speech > CUE.s5ModEnd) {
    decodedCount = LOAD_BITS.length;
  }

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
    dataPulseStrength: decodedCount > 0 ? 1 : 0,
    activeDataBit: activeBit,
    dataReceiveGlow: loadModulation,
    rulerOpacity: 0,
  };
};

export const evaluateScene6 = (s: SceneState): WorldState => {
  const camProgress = interpolate(s.speech, [0, 0.48], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const sepProgress = interpolate(s.speech, [CUE.s6PullStart, CUE.s6PullEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const cardY = interpolate(sepProgress, [0, 1], [1.36, 5.8]);
  const phoneY = interpolate(sepProgress, [0, 1], [-1.2, -3.56]);
  const gapCm = cardY - (phoneY + PHONE_COIL_LOCAL_Y);

  const decay = 1 / (1 + Math.pow(Math.max(0, gapCm - 2.2) / 2.0, 2.5));
  const capacitorCharge = Math.max(0.08, decay);
  const energyWarning = gapCm >= 4.2;

  const rulerOpacity = interpolate(s.speech, [0.04, 0.14], [0, 1], {
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

export const useContinuousWorld = (): WorldState => {
  const { fps } = useTiming();
  const s0 = useScene(0);
  const s1 = useScene(1);
  const s2 = useScene(2);
  const s3 = useScene(3);
  const s4 = useScene(4);
  const s5 = useScene(5);

  if (s0.active) return evaluateScene1(s0);
  if (s1.active) return evaluateScene2(s1, fps);
  if (s2.active) return evaluateScene3(s2);
  if (s3.active) return evaluateScene4(s3);
  if (s4.active) return evaluateScene5(s4);
  return evaluateScene6(s5);
};

export const SceneOverlays: React.FC = () => {
  const s3 = useScene(3);
  const s4 = useScene(4);
  const s5 = useScene(5);

  const s4World = evaluateScene4(s3);
  const capPercent = Math.round(s4World.capacitorCharge * 100);

  const decodedCount =
    s4.speech < CUE.s5ModStart
      ? 0
      : Math.min(
          LOAD_BITS.length,
          Math.floor(
            ((s4.speech - CUE.s5ModStart) / (CUE.s5ModEnd - CUE.s5ModStart)) *
              LOAD_BITS.length,
          ) + 1,
        );
  const visibleBits = LOAD_BITS.slice(0, decodedCount).join('');

  const s5World = evaluateScene6(s5);
  const gapCm = s5World.cardPos[1] - (s5World.phonePos[1] + PHONE_COIL_LOCAL_Y);

  return (
    <>
      {/* Adegan 1 */}
      <ScreenTitle
        sceneIndex={0}
        text="Tanpa Baterai"
        enterAtSpeech={CUE.s1Battery}
        accentColor={theme.danger}
      />
      <ScreenLabel
        sceneIndex={0}
        text="0 mAh · Pasif"
        enterAtSpeech={CUE.s1Battery}
        staggerFrames={6}
        row={0}
        accentColor={theme.danger}
        mono
        icon="no-battery"
      />
      <ScreenLabel
        sceneIndex={0}
        text="Sumber Daya: ?"
        enterAtSpeech={CUE.s1Question}
        row={1}
        accentColor={theme.current}
      />

      {/* Adegan 2 */}
      <ScreenTitle
        sceneIndex={1}
        text="Medan Magnet AC"
        enterAtSpeech={CUE.s2AcStart}
        accentColor={theme.field}
      />
      <ScreenLabel
        sceneIndex={1}
        text="13,56 MHz AC"
        enterAtSpeech={CUE.s2FreqLabel}
        row={0}
        accentColor={theme.current}
        mono
      />
      <ScreenLabel
        sceneIndex={1}
        text="1,5 Hz (disederhanakan)"
        enterAtSpeech={CUE.s2FieldPulse}
        staggerFrames={6}
        row={1}
        accentColor={theme.field}
        mono
      />

      {/* Adegan 3 */}
      <ScreenTitle
        sceneIndex={2}
        text="Induksi Transformator"
        enterAtSpeech={CUE.s3Transformer}
        accentColor={theme.current}
      />
      <ScreenLabel
        sceneIndex={2}
        text="Kumparan Sekunder"
        enterAtSpeech={CUE.s3CutawayStart}
        row={0}
        accentColor={theme.text}
      />
      <ScreenLabel
        sceneIndex={2}
        text="Arus Induksi AC"
        enterAtSpeech={CUE.s3Induce}
        staggerFrames={6}
        row={1}
        accentColor={theme.current}
      />

      {/* Adegan 4 */}
      <ScreenTitle
        sceneIndex={3}
        text="Chip Menyala"
        enterAtSpeech={CUE.s4ChipOn}
        accentColor={theme.current}
      />
      <ScreenLabel
        sceneIndex={3}
        text="Penyearah AC → DC"
        enterAtSpeech={CUE.s4Rectify}
        row={0}
        accentColor={theme.current}
      />
      <ScreenLabel
        sceneIndex={3}
        text={`Kapasitor: ${capPercent}%`}
        enterAtSpeech={CUE.s4CapStart}
        staggerFrames={6}
        row={1}
        accentColor={s4World.chipPowered ? theme.current : theme.textMuted}
        mono
      />

      {/* Adegan 5 */}
      <ScreenTitle
        sceneIndex={4}
        text="Modulasi Beban"
        enterAtSpeech={CUE.s5ModStart}
        accentColor={theme.data}
      />
      <ScreenLabel
        sceneIndex={4}
        text="Riak Medan Pembaca"
        enterAtSpeech={CUE.s5ModStart}
        staggerFrames={6}
        row={0}
        accentColor={theme.field}
      />
      <ScreenLabel
        sceneIndex={4}
        text={`Data: ${visibleBits || '...'}`}
        enterAtSpeech={CUE.s5DataLabel}
        row={1}
        accentColor={theme.data}
        mono
      />

      {/* Adegan 6 */}
      <ScreenTitle
        sceneIndex={5}
        text="Batas Beberapa Cm"
        enterAtSpeech={CUE.s6LimitLabel}
        exitAtProgress={0.68}
        accentColor={theme.field}
      />
      <ScreenTitle
        sceneIndex={5}
        text="Follow Sains Harian"
        enterAtSpeech={CUE.s6Follow}
        exitAtProgress={0.94}
        accentColor={theme.data}
      />
      <ScreenLabel
        sceneIndex={5}
        text={`Jarak: ${gapCm.toFixed(1)} cm`}
        enterAtSpeech={CUE.s6LimitLabel}
        staggerFrames={6}
        exitAtProgress={0.94}
        row={0}
        accentColor={s5World.energyWarning ? theme.danger : theme.data}
        mono
      />
      <ScreenLabel
        sceneIndex={5}
        text={s5World.energyWarning ? 'Energi Tidak Cukup' : 'Energi Cukup'}
        enterAtSpeech={CUE.s6LimitLabel}
        staggerFrames={12}
        exitAtProgress={0.94}
        row={1}
        accentColor={s5World.energyWarning ? theme.danger : theme.current}
      />
    </>
  );
};
