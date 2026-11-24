import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from '../theme';
import { Coil } from './Coil';

export interface PhoneProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  coilEmissiveIntensity?: number;
  coilDimFactor?: number;
  dataReceiveGlow?: number;
}

const createRoundedRect = (w: number, h: number, r: number): THREE.Shape => {
  const hw = w / 2;
  const hh = h / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + r);
  s.lineTo(hw, hh - r);
  s.quadraticCurveTo(hw, hh, hw - r, hh);
  s.lineTo(-hw + r, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - r);
  s.lineTo(-hw, -hh + r);
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return s;
};

export const PHONE_COIL_LOCAL_Y = 0.36;

export const Phone: React.FC<PhoneProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  coilEmissiveIntensity = 0,
  coilDimFactor = 1,
  dataReceiveGlow = 0,
}) => {
  const { frameGeo, backGeo, cameraIslandGeo, bayGeo } = useMemo(() => {
    const fShape = createRoundedRect(7.4, 13.8, 0.78);
    const bShape = createRoundedRect(7.05, 13.45, 0.66);
    const camShape = createRoundedRect(2.35, 2.55, 0.42);
    const bayShape = createRoundedRect(4.8, 4.8, 0.55);

    const fGeo = new THREE.ExtrudeGeometry(fShape, {
      depth: 0.62,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.06,
      bevelSegments: 3,
    });
    fGeo.rotateX(-Math.PI / 2);

    const bkGeo = new THREE.ExtrudeGeometry(bShape, {
      depth: 0.08,
      bevelEnabled: false,
    });
    bkGeo.rotateX(-Math.PI / 2);

    const cGeo = new THREE.ExtrudeGeometry(camShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    cGeo.rotateX(-Math.PI / 2);

    const byGeo = new THREE.ExtrudeGeometry(bayShape, {
      depth: 0.04,
      bevelEnabled: false,
    });
    byGeo.rotateX(-Math.PI / 2);

    return {
      frameGeo: fGeo,
      backGeo: bkGeo,
      cameraIslandGeo: cGeo,
      bayGeo: byGeo,
    };
  }, []);

  useEffect(() => {
    return () => {
      frameGeo.dispose();
      backGeo.dispose();
      cameraIslandGeo.dispose();
      bayGeo.dispose();
    };
  }, [frameGeo, backGeo, cameraIslandGeo, bayGeo]);

  // Offset phone body along +Z so its upper NFC coil sits cleanly at local (0, PHONE_COIL_LOCAL_Y, 0)
  const bodyZOffset = 2.6;

  return (
    <group position={position} rotation={rotation}>
      {/* Anodized aluminum mid-frame */}
      <mesh position={[0, -0.34, bodyZOffset]} geometry={frameGeo} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.PHONE_FRAME} metalness={0.78} roughness={0.32} />
      </mesh>

      {/* Matte dark back panel */}
      <mesh position={[0, 0.28, bodyZOffset]} geometry={backGeo} receiveShadow>
        <meshStandardMaterial color={COLORS.PHONE_CHASSIS} metalness={0.18} roughness={0.62} />
      </mesh>

      {/* Recessed cutaway bay exposing internal NFC reader coil */}
      <mesh position={[0, 0.33, 0]} geometry={bayGeo} receiveShadow>
        <meshStandardMaterial color={COLORS.PHONE_BACK_GLASS} metalness={0.15} roughness={0.75} />
      </mesh>

      {/* Circular NFC reader copper coil */}
      <Coil
        variant="circular"
        position={[0, PHONE_COIL_LOCAL_Y, 0]}
        emissiveColor={COLORS.CURRENT}
        emissiveIntensity={coilEmissiveIntensity}
        dimFactor={coilDimFactor}
      />

      {/* Reader demodulator sense node (highlights in DATA color when reading load modulation) */}
      <mesh position={[2.25, 0.37, 1.35]}>
        <boxGeometry args={[0.75, 0.06, 0.55]} />
        <meshStandardMaterial
          color={dataReceiveGlow > 0.05 ? COLORS.DATA : COLORS.SILICON_DIE}
          emissive={COLORS.DATA}
          emissiveIntensity={dataReceiveGlow * 0.9}
          roughness={0.35}
          metalness={0.45}
        />
      </mesh>

      {/* Camera island bump + dual lenses for recognizable smartphone silhouette */}
      <group position={[-2.1, 0.34, -2.5]}>
        <mesh geometry={cameraIslandGeo} castShadow receiveShadow>
          <meshStandardMaterial color={COLORS.PHONE_CAMERA_RING} metalness={0.55} roughness={0.38} />
        </mesh>
        {[-0.58, 0.58].map((lz, i) => (
          <group key={i} position={[0, 0.16, lz]}>
            <mesh>
              <cylinderGeometry args={[0.42, 0.44, 0.08, 24]} />
              <meshStandardMaterial color={COLORS.PHONE_FRAME} metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.31, 0.31, 0.05, 24]} />
              <meshStandardMaterial color={COLORS.PHONE_LENS} metalness={0.2} roughness={0.12} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
