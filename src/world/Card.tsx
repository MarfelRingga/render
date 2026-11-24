import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { COLORS } from '../theme';
import { Chip } from './Chip';
import { Coil } from './Coil';

export interface CardProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  cutaway?: number;
  coilEmissiveIntensity?: number;
  coilDimFactor?: number;
  capacitorCharge?: number;
  chipPowered?: boolean;
  chipPowerLevel?: number;
  loadModulation?: number;
  energyWarning?: boolean;
}

const createRoundedRectShape = (width: number, height: number, radius: number): THREE.Shape => {
  const hw = width / 2;
  const hh = height / 2;
  const s = new THREE.Shape();
  s.moveTo(-hw + radius, -hh);
  s.lineTo(hw - radius, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + radius);
  s.lineTo(hw, hh - radius);
  s.quadraticCurveTo(hw, hh, hw - radius, hh);
  s.lineTo(-hw + radius, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - radius);
  s.lineTo(-hw, -hh + radius);
  s.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
  return s;
};

export const Card: React.FC<CardProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  cutaway = 0,
  coilEmissiveIntensity = 0,
  coilDimFactor = 1,
  capacitorCharge = 0,
  chipPowered = false,
  chipPowerLevel = 0,
  loadModulation = 0,
  energyWarning = false,
}) => {
  const { bottomGeo, coreGeo, topCoverGeo, arcGeos } = useMemo(() => {
    const outerShape = createRoundedRectShape(8.56, 5.4, 0.38);
    const coreShape = createRoundedRectShape(8.2, 5.04, 0.3);

    const bGeo = new THREE.ExtrudeGeometry(outerShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    });
    bGeo.rotateX(-Math.PI / 2);

    const cGeo = new THREE.ExtrudeGeometry(coreShape, {
      depth: 0.04,
      bevelEnabled: false,
    });
    cGeo.rotateX(-Math.PI / 2);

    const tGeo = new THREE.ExtrudeGeometry(outerShape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    });
    tGeo.rotateX(-Math.PI / 2);

    const arcs = [0.28, 0.48, 0.68, 0.88].map((r) => {
      const g = new THREE.RingGeometry(r, r + 0.055, 24, 1, -Math.PI * 0.28, Math.PI * 0.56);
      g.rotateX(-Math.PI / 2);
      return g;
    });

    return { bottomGeo: bGeo, coreGeo: cGeo, topCoverGeo: tGeo, arcGeos: arcs };
  }, []);

  useEffect(() => {
    return () => {
      bottomGeo.dispose();
      coreGeo.dispose();
      topCoverGeo.dispose();
      arcGeos.forEach((g) => g.dispose());
    };
  }, [bottomGeo, coreGeo, topCoverGeo, arcGeos]);

  const coverOpacity = Math.max(0, 1 - cutaway * 1.15);
  const coverLiftY = cutaway * 1.1;
  const coverSlideX = -cutaway * 2.4;

  return (
    <group position={position} rotation={rotation}>
      {/* Bottom matte PVC base */}
      <mesh position={[0, -0.08, 0]} geometry={bottomGeo} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.CARD_BODY} roughness={0.62} metalness={0.08} />
      </mesh>

      {/* Internal PET/FR4 substrate layer (no battery anywhere) */}
      <mesh position={[0, -0.02, 0]} geometry={coreGeo} receiveShadow>
        <meshStandardMaterial color={COLORS.CARD_SUBSTRATE} roughness={0.78} metalness={0.05} />
      </mesh>

      {/* Rectangular 4-turn copper NFC antenna coil */}
      <Coil
        variant="rectangular"
        position={[0, 0.025, 0]}
        emissiveColor={COLORS.CURRENT}
        emissiveIntensity={coilEmissiveIntensity}
        dimFactor={coilDimFactor}
      />

      {/* Rectifier -> Capacitor -> NFC Silicon Chip */}
      <Chip
        capacitorCharge={capacitorCharge}
        chipPowered={chipPowered}
        chipPowerLevel={chipPowerLevel}
        loadModulation={loadModulation}
        energyWarning={energyWarning}
      />

      {/* Top matte PVC cutaway cover */}
      {coverOpacity > 0.01 && (
        <group position={[coverSlideX, 0.08 + coverLiftY, 0]}>
          <mesh geometry={topCoverGeo} castShadow receiveShadow>
            <meshStandardMaterial
              color={COLORS.CARD_BODY}
              roughness={0.55}
              metalness={0.1}
              transparent={coverOpacity < 1}
              opacity={coverOpacity}
            />
          </mesh>

          {/* Subtle engraved border accent */}
          <mesh position={[-2.9, 0.072, -1.65]}>
            <boxGeometry args={[1.55, 0.01, 0.04]} />
            <meshStandardMaterial
              color={COLORS.CARD_EDGE}
              roughness={0.4}
              metalness={0.4}
              transparent={coverOpacity < 1}
              opacity={coverOpacity}
            />
          </mesh>
          <mesh position={[-3.3, 0.072, -1.42]}>
            <boxGeometry args={[0.75, 0.01, 0.035]} />
            <meshStandardMaterial
              color={COLORS.CARD_ACCENT}
              roughness={0.4}
              metalness={0.4}
              transparent={coverOpacity < 1}
              opacity={coverOpacity}
            />
          </mesh>

          {/* Procedural contactless wave emblem (4 arcs) */}
          <group position={[2.65, 0.074, 0.05]}>
            {arcGeos.map((g, idx) => (
              <mesh key={idx} geometry={g}>
                <meshStandardMaterial
                  color={COLORS.TEXT_SECONDARY}
                  roughness={0.35}
                  metalness={0.55}
                  transparent={coverOpacity < 1}
                  opacity={coverOpacity}
                />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
};
