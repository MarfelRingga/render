import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { theme } from '../../lib/EpisodeShell';

export const buildRectifierToCapCurve = (): THREE.CatmullRomCurve3 => {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.15, 0.03, 0.35),
    new THREE.Vector3(2.85, 0.03, 0.35),
    new THREE.Vector3(2.55, 0.03, 0.35),
  ]);
};

export const buildCapToChipCurve = (): THREE.CatmullRomCurve3 => {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(2.2, 0.03, 0.35),
    new THREE.Vector3(1.85, 0.03, 0.35),
    new THREE.Vector3(1.55, 0.03, 0.25),
  ]);
};

interface ChipProps {
  capacitorCharge: number;
  chipPowered: boolean;
  chipPowerLevel: number;
  loadModulation: number;
  energyWarning: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  capacitorCharge,
  chipPowered,
  chipPowerLevel,
  loadModulation,
  energyWarning,
}) => {
  const { traceA, traceB, feedTraceTop, feedTraceBottom, chipShape } = useMemo(() => {
    const tA = new THREE.TubeGeometry(buildRectifierToCapCurve(), 20, 0.022, 6, false);
    const tB = new THREE.TubeGeometry(buildCapToChipCurve(), 20, 0.022, 6, false);

    const fTop = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(3.48, 0.03, 0.0),
        new THREE.Vector3(3.32, 0.03, 0.16),
        new THREE.Vector3(3.18, 0.03, 0.25),
      ]),
      16,
      0.02,
      6,
      false,
    );

    const fBottom = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(3.48, 0.03, 0.72),
        new THREE.Vector3(3.32, 0.03, 0.56),
        new THREE.Vector3(3.18, 0.03, 0.45),
      ]),
      16,
      0.02,
      6,
      false,
    );

    const s = new THREE.Shape();
    const w = 0.46;
    const h = 0.46;
    const r = 0.06;
    s.moveTo(-w + r, -h);
    s.lineTo(w - r, -h);
    s.quadraticCurveTo(w, -h, w, -h + r);
    s.lineTo(w, h - r);
    s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(-w + r, h);
    s.quadraticCurveTo(-w, h, -w, h - r);
    s.lineTo(-w, -h + r);
    s.quadraticCurveTo(-w, -h, -w + r, -h);

    const chipGeo = new THREE.ExtrudeGeometry(s, {
      depth: 0.09,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    });
    chipGeo.rotateX(-Math.PI / 2);

    return {
      traceA: tA,
      traceB: tB,
      feedTraceTop: fTop,
      feedTraceBottom: fBottom,
      chipShape: chipGeo,
    };
  }, []);

  useEffect(() => {
    return () => {
      traceA.dispose();
      traceB.dispose();
      feedTraceTop.dispose();
      feedTraceBottom.dispose();
      chipShape.dispose();
    };
  }, [traceA, traceB, feedTraceTop, feedTraceBottom, chipShape]);

  const clampedCharge = Math.max(0.02, Math.min(1, capacitorCharge));
  const gaugeColor = energyWarning ? theme.danger : theme.current;
  const chipEmissive = chipPowered
    ? loadModulation > 0.5
      ? theme.data
      : theme.current
    : theme.surface;
  const chipEmissiveIntensity = chipPowered
    ? 0.45 + 0.55 * chipPowerLevel + 0.35 * loadModulation
    : 0;

  return (
    <group>
      <mesh geometry={feedTraceTop}>
        <meshStandardMaterial color={theme.surfaceLight} metalness={0.72} roughness={0.46} />
      </mesh>
      <mesh geometry={feedTraceBottom}>
        <meshStandardMaterial color={theme.surfaceLight} metalness={0.72} roughness={0.46} />
      </mesh>
      <mesh geometry={traceA}>
        <meshStandardMaterial
          color={theme.surfaceLight}
          metalness={0.72}
          roughness={0.46}
          emissive={theme.current}
          emissiveIntensity={clampedCharge > 0.08 ? 0.25 : 0}
        />
      </mesh>
      <mesh geometry={traceB}>
        <meshStandardMaterial
          color={theme.surfaceLight}
          metalness={0.72}
          roughness={0.46}
          emissive={theme.current}
          emissiveIntensity={chipPowered ? 0.45 * chipPowerLevel : 0}
        />
      </mesh>

      {/* Bridge Rectifier (4 SMD Diodes) */}
      <group position={[3.05, 0.04, 0.35]}>
        {[
          [-0.1, -0.1],
          [0.1, -0.1],
          [-0.1, 0.1],
          [0.1, 0.1],
        ].map(([dx, dz], idx) => (
          <group key={idx} position={[dx, 0, dz]}>
            <mesh>
              <boxGeometry args={[0.13, 0.055, 0.075]} />
              <meshStandardMaterial color={theme.surface} roughness={0.58} metalness={0} />
            </mesh>
            <mesh position={[0.045, 0.005, 0]}>
              <boxGeometry args={[0.03, 0.058, 0.078]} />
              <meshStandardMaterial color={theme.textMuted} roughness={0.45} metalness={0.75} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Smoothing Capacitor + Integrated Charge Gauge */}
      <group position={[2.38, 0.03, 0.35]}>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.18, 20]} />
          <meshStandardMaterial color={theme.surfaceLight} metalness={0.55} roughness={0.48} />
        </mesh>
        <mesh position={[0, 0.182, 0]}>
          <cylinderGeometry args={[0.145, 0.145, 0.01, 20]} />
          <meshStandardMaterial color={theme.textMuted} metalness={0.7} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.195, 0]} scale={[clampedCharge, 1, 1]}>
          <boxGeometry args={[0.22, 0.025, 0.05]} />
          <meshStandardMaterial
            color={gaugeColor}
            emissive={gaugeColor}
            emissiveIntensity={energyWarning ? 0.75 : 0.4 + 0.6 * clampedCharge}
            roughness={0.45}
            metalness={0}
          />
        </mesh>
      </group>

      {/* NFC Silicon IC Package + Leadframe Pins */}
      <group position={[1.15, 0.02, 0.25]}>
        <mesh geometry={chipShape}>
          <meshStandardMaterial color={theme.surface} roughness={0.55} metalness={0} />
        </mesh>
        <mesh position={[0, 0.106, 0]}>
          <boxGeometry args={[0.42, 0.018, 0.42]} />
          <meshStandardMaterial
            color={chipPowered ? chipEmissive : theme.surfaceLight}
            emissive={chipEmissive}
            emissiveIntensity={chipEmissiveIntensity}
            roughness={0.45}
            metalness={0}
          />
        </mesh>
        {[-0.27, -0.09, 0.09, 0.27].map((px, i) => (
          <React.Fragment key={i}>
            <mesh position={[px, 0.02, 0.5]}>
              <boxGeometry args={[0.07, 0.025, 0.12]} />
              <meshStandardMaterial color={theme.textMuted} metalness={0.78} roughness={0.45} />
            </mesh>
            <mesh position={[px, 0.02, -0.5]}>
              <boxGeometry args={[0.07, 0.025, 0.12]} />
              <meshStandardMaterial color={theme.textMuted} metalness={0.78} roughness={0.45} />
            </mesh>
          </React.Fragment>
        ))}
      </group>
    </group>
  );
};
