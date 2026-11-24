import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '../theme';
import { FPS, VISUAL_FIELD_HZ } from '../timing';

interface FieldLinesProps {
  origin: [number, number, number];
  frame: number;
  strength: number;
  loadRipple?: number;
}

interface ShellSpec {
  readonly rInner: number;
  readonly rOuter: number;
  readonly yPeak: number;
  readonly tubeRadius: number;
  readonly azimuthCount: number;
  readonly baseOpacity: number;
}

const SHELLS: readonly ShellSpec[] = [
  { rInner: 0.55, rOuter: 2.35, yPeak: 2.35, tubeRadius: 0.028, azimuthCount: 6, baseOpacity: 0.88 },
  { rInner: 1.05, rOuter: 3.75, yPeak: 4.15, tubeRadius: 0.022, azimuthCount: 6, baseOpacity: 0.65 },
  { rInner: 1.48, rOuter: 5.35, yPeak: 6.05, tubeRadius: 0.017, azimuthCount: 4, baseOpacity: 0.42 },
];

const buildDipoleLoopCurve = (shell: ShellSpec, azimuth: number): THREE.CatmullRomCurve3 => {
  const cosA = Math.cos(azimuth);
  const sinA = Math.sin(azimuth);

  const pts2D: Array<[number, number]> = [
    [shell.rInner, 0],
    [shell.rInner * 1.15, shell.yPeak * 0.52],
    [(shell.rInner + shell.rOuter) * 0.45, shell.yPeak],
    [shell.rOuter * 0.92, shell.yPeak * 0.58],
    [shell.rOuter, 0],
    [shell.rOuter * 0.92, -shell.yPeak * 0.58],
    [(shell.rInner + shell.rOuter) * 0.45, -shell.yPeak],
    [shell.rInner * 1.15, -shell.yPeak * 0.52],
  ];

  const points = pts2D.map(([r, y]) => new THREE.Vector3(r * cosA, y, r * sinA));
  return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.45);
};

const _dummy = new THREE.Object3D();
const _pos = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

export const FieldLines: React.FC<FieldLinesProps> = ({
  origin,
  frame,
  strength,
  loadRipple = 0,
}) => {
  const beadsRef = useRef<THREE.InstancedMesh>(null);

  const { loopGeometries, loopCurves, beadGeo } = useMemo(() => {
    const geos: Array<{ geometry: THREE.TubeGeometry; baseOpacity: number }> = [];
    const curves: THREE.CatmullRomCurve3[] = [];

    SHELLS.forEach((shell, shellIdx) => {
      const angleOffset = (shellIdx * Math.PI) / shell.azimuthCount;
      for (let i = 0; i < shell.azimuthCount; i++) {
        const azimuth = angleOffset + (i * Math.PI * 2) / shell.azimuthCount;
        const curve = buildDipoleLoopCurve(shell, azimuth);
        curves.push(curve);
        geos.push({
          geometry: new THREE.TubeGeometry(curve, 56, shell.tubeRadius, 6, true),
          baseOpacity: shell.baseOpacity,
        });
      }
    });

    const bGeo = new THREE.ConeGeometry(0.085, 0.22, 8);
    return { loopGeometries: geos, loopCurves: curves, beadGeo: bGeo };
  }, []);

  useEffect(() => {
    return () => {
      loopGeometries.forEach((item) => item.geometry.dispose());
      beadGeo.dispose();
    };
  }, [loopGeometries, beadGeo]);

  const timeSec = frame / FPS;
  const phase = 2 * Math.PI * VISUAL_FIELD_HZ * timeSec;
  const wave = Math.sin(phase);
  const absWave = Math.abs(wave);
  const polaritySign = wave >= 0 ? 1 : -1;

  // Load modulation produces a subtle ~14% amplitude dip on the shared magnetic field
  const rippleEnvelope = 1 - 0.14 * loadRipple;
  const effectiveStrength = Math.max(0, Math.min(1, strength)) * rippleEnvelope;

  const beadsPerLoop = 2;
  const totalBeads = loopCurves.length * beadsPerLoop;

  useLayoutEffect(() => {
    const mesh = beadsRef.current;
    if (!mesh) return;

    const travelShift = (timeSec * VISUAL_FIELD_HZ * 0.65) % 1;
    let instanceIdx = 0;

    for (let c = 0; c < loopCurves.length; c++) {
      const curve = loopCurves[c];
      for (let b = 0; b < beadsPerLoop; b++) {
        const baseU = b / beadsPerLoop;
        const u = (((baseU + polaritySign * travelShift) % 1) + 1) % 1;
        curve.getPointAt(u, _pos);
        curve.getTangentAt(u, _tan);
        if (polaritySign < 0) {
          _tan.negate();
        }
        _dummy.position.copy(_pos);
        _dummy.quaternion.setFromUnitVectors(_up, _tan.normalize());
        const beadScale = effectiveStrength * (0.45 + 0.55 * absWave);
        _dummy.scale.setScalar(beadScale);
        _dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx, _dummy.matrix);
        instanceIdx++;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [loopCurves, timeSec, polaritySign, effectiveStrength, absWave]);

  if (effectiveStrength <= 0.01) {
    return null;
  }

  return (
    <group position={origin} scale={[rippleEnvelope, rippleEnvelope, rippleEnvelope]}>
      {loopGeometries.map((item, idx) => (
        <mesh key={idx} geometry={item.geometry}>
          <meshStandardMaterial
            color={COLORS.FIELD}
            emissive={COLORS.FIELD}
            emissiveIntensity={effectiveStrength * (0.28 + 0.52 * absWave)}
            roughness={0.35}
            metalness={0.1}
            transparent
            opacity={item.baseOpacity * effectiveStrength * (0.4 + 0.6 * absWave)}
            depthWrite={false}
          />
        </mesh>
      ))}

      <instancedMesh ref={beadsRef} args={[beadGeo, undefined, totalBeads]} frustumCulled={false}>
        <meshStandardMaterial
          color={COLORS.FIELD}
          emissive={COLORS.FIELD}
          emissiveIntensity={0.85 * effectiveStrength}
          roughness={0.25}
          transparent
          opacity={0.92 * effectiveStrength}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
};
