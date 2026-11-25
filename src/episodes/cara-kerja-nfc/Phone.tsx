import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { theme } from '../../lib/EpisodeShell';
import { Coil } from './Coil';

export interface PhoneProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  coilEmissiveIntensity?: number;
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

  const bodyZOffset = 2.6;

  return (
    <group position={position} rotation={rotation}>
      {/* Metallic anodized frame */}
      <mesh position={[0, -0.34, bodyZOffset]} geometry={frameGeo}>
        <meshStandardMaterial color={theme.surfaceLight} metalness={0.68} roughness={0.46} />
      </mesh>

      {/* Matte rear chassis */}
      <mesh position={[0, 0.28, bodyZOffset]} geometry={backGeo}>
        <meshStandardMaterial color={theme.surface} metalness={0} roughness={0.58} />
      </mesh>

      {/* Recessed cutaway bay for NFC reader coil */}
      <mesh position={[0, 0.33, 0]} geometry={bayGeo}>
        <meshStandardMaterial color={theme.surfaceLight} metalness={0} roughness={0.68} />
      </mesh>

      {/* Circular NFC reader coil */}
      <Coil
        variant="circular"
        position={[0, PHONE_COIL_LOCAL_Y, 0]}
        emissiveIntensity={coilEmissiveIntensity}
      />

      {/* Demodulator sense node */}
      <mesh position={[2.25, 0.37, 1.35]}>
        <boxGeometry args={[0.75, 0.06, 0.55]} />
        <meshStandardMaterial
          color={dataReceiveGlow > 0.05 ? theme.data : theme.surface}
          emissive={theme.data}
          emissiveIntensity={dataReceiveGlow * 0.9}
          roughness={0.48}
          metalness={0}
        />
      </mesh>

      {/* Dual-lens camera bump */}
      <group position={[-2.1, 0.34, -2.5]}>
        <mesh geometry={cameraIslandGeo}>
          <meshStandardMaterial color={theme.surfaceLight} metalness={0.5} roughness={0.48} />
        </mesh>
        {[-0.58, 0.58].map((lz, i) => (
          <group key={i} position={[0, 0.16, lz]}>
            <mesh>
              <cylinderGeometry args={[0.42, 0.44, 0.08, 24]} />
              <meshStandardMaterial color={theme.textMuted} metalness={0.75} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.31, 0.31, 0.05, 24]} />
              <meshStandardMaterial color={theme.surface} metalness={0} roughness={0.45} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
