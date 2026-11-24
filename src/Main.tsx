import React, { useLayoutEffect } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { COLORS, VIDEO_HEIGHT, VIDEO_WIDTH } from './theme';
import { getSceneByFrame, SCENES } from './timing';
import { evaluateScene1World, Scene1, WorldState } from './scenes/Scene1';
import { evaluateScene2World, Scene2 } from './scenes/Scene2';
import { evaluateScene3World, Scene3 } from './scenes/Scene3';
import { evaluateScene4World, Scene4 } from './scenes/Scene4';
import { evaluateScene5World, Scene5 } from './scenes/Scene5';
import { CentimeterRuler, evaluateScene6World, Scene6 } from './scenes/Scene6';
import { Card } from './world/Card';
import { CurrentFlow } from './world/CurrentFlow';
import { FieldLines } from './world/FieldLines';
import { PHONE_COIL_LOCAL_Y, Phone } from './world/Phone';

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

const evaluateWorldState = (frame: number): WorldState => {
  const { scene, localFrame } = getSceneByFrame(frame);
  switch (scene.id) {
    case 1:
      return evaluateScene1World(localFrame, scene);
    case 2:
      return evaluateScene2World(localFrame, scene);
    case 3:
      return evaluateScene3World(localFrame, scene);
    case 4:
      return evaluateScene4World(localFrame, scene);
    case 5:
      return evaluateScene5World(localFrame, scene);
    case 6:
      return evaluateScene6World(localFrame, scene);
  }
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const world = evaluateWorldState(frame);

  const phoneCoilOrigin: [number, number, number] = [
    world.phonePos[0],
    world.phonePos[1] + PHONE_COIL_LOCAL_Y,
    world.phonePos[2],
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.BG_GRADIENT }}>
      <ThreeCanvas
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        dpr={1}
        camera={{ fov: 48, near: 0.1, far: 120, position: [4.2, 7.8, 17.8] }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <CameraRig position={world.cameraPos} target={world.cameraTarget} />

        {/* Maximum 3 lights: warm key + cool rim + hemisphere fill */}
        <hemisphereLight args={[COLORS.HEMI_SKY, COLORS.HEMI_GROUND, 0.85]} />
        <directionalLight position={[9, 14, 10]} intensity={2.2} color={COLORS.KEY_LIGHT} />
        <directionalLight position={[-10, 6, -8]} intensity={1.15} color={COLORS.RIM_LIGHT} />

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
          frame={frame}
          strength={world.fieldStrength}
          loadRipple={world.fieldRipple}
        />

        <CurrentFlow
          frame={frame}
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

      <Sequence from={SCENES[0].startFrame} durationInFrames={SCENES[0].durationInFrames}>
        <Scene1 scene={SCENES[0]} />
      </Sequence>
      <Sequence from={SCENES[1].startFrame} durationInFrames={SCENES[1].durationInFrames}>
        <Scene2 scene={SCENES[1]} />
      </Sequence>
      <Sequence from={SCENES[2].startFrame} durationInFrames={SCENES[2].durationInFrames}>
        <Scene3 scene={SCENES[2]} />
      </Sequence>
      <Sequence from={SCENES[3].startFrame} durationInFrames={SCENES[3].durationInFrames}>
        <Scene4 scene={SCENES[3]} />
      </Sequence>
      <Sequence from={SCENES[4].startFrame} durationInFrames={SCENES[4].durationInFrames}>
        <Scene5 scene={SCENES[4]} />
      </Sequence>
      <Sequence from={SCENES[5].startFrame} durationInFrames={SCENES[5].durationInFrames}>
        <Scene6 scene={SCENES[5]} />
      </Sequence>
    </AbsoluteFill>
  );
};
