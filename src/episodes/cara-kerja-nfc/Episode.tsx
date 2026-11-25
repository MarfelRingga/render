import React, { useLayoutEffect } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { AbsoluteFill } from 'remotion';
import { theme } from '../../lib/EpisodeShell';
import { Card } from './Card';
import { CurrentFlow } from './CurrentFlow';
import { FieldLines } from './FieldLines';
import { PHONE_COIL_LOCAL_Y, Phone } from './Phone';
import { CentimeterRuler } from './Ruler';
import { SceneOverlays, useContinuousWorld } from './scenes';

const CameraRig: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
}> = ({ position, target }) => {
  const camera = useThree((state) => state.camera);

  useLayoutEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(target[0], target[1], target[2]);
    camera.updateMatrixWorld();
  }, [camera, position, target]);

  return null;
};

export default function Episode() {
  const world = useContinuousWorld();

  const phoneCoilOrigin: [number, number, number] = [
    world.phonePos[0],
    world.phonePos[1] + PHONE_COIL_LOCAL_Y,
    world.phonePos[2],
  ];

  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={1080}
        height={1920}
        dpr={1}
        camera={{ fov: 48, near: 0.1, far: 120, position: [4.2, 7.8, 17.8] }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <CameraRig position={world.cameraPos} target={world.cameraTarget} />

        {/* 3-point lighting: low hemisphere + front-top key + back-side field rim */}
        <hemisphereLight args={[theme.surfaceLight, theme.bg, 0.45]} />
        <directionalLight position={[6, 12, 10]} intensity={2.1} color={theme.text} />
        <directionalLight position={[-11, 5, -9]} intensity={1.9} color={theme.field} />

        <Card
          position={world.cardPos}
          rotation={world.cardRot}
          cutaway={world.cardCutaway}
          coilEmissiveIntensity={world.cardCoilEmissive}
          coilDimFactor={world.cardCoilDim}
          capacitorCharge={world.capacitorCharge}
          chipPowered={world.chipPowered}
          chipPowerLevel={world.chipPowerLevel}
          loadModulation={world.loadModulation}
          energyWarning={world.energyWarning}
        />

        <Phone
          position={world.phonePos}
          rotation={world.phoneRot}
          coilEmissiveIntensity={world.phoneCoilEmissive}
          dataReceiveGlow={world.dataReceiveGlow}
        />

        <FieldLines
          origin={phoneCoilOrigin}
          strength={world.fieldStrength}
          loadRipple={world.fieldRipple}
        />

        <CurrentFlow
          phoneOrigin={world.phonePos}
          phoneRot={world.phoneRot}
          cardOrigin={world.cardPos}
          cardRot={world.cardRot}
          phoneCurrentStrength={world.phoneCurrentStrength}
          cardCurrentStrength={world.cardInducedStrength}
          dcRectifierStrength={world.dcRectifierStrength}
          dcChipFeedStrength={world.dcChipFeedStrength}
          dataPulseStrength={world.dataPulseStrength}
          activeDataBit={world.activeDataBit}
        />

        <CentimeterRuler
          baseY={phoneCoilOrigin[1]}
          topY={world.cardPos[1]}
          opacity={world.rulerOpacity}
        />
      </ThreeCanvas>

      <SceneOverlays />
    </AbsoluteFill>
  );
}
