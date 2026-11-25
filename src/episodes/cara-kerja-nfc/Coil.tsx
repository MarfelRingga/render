import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { theme } from '../../lib/EpisodeShell';

export type CoilVariant = 'rectangular' | 'circular';

export const buildCardCoilCurve = (): THREE.CatmullRomCurve3 => {
  const points: THREE.Vector3[] = [];
  const turns = 4;
  const startHalfW = 3.85;
  const startHalfH = 2.25;
  const pitch = 0.14;
  const cornerRadius = 0.34;

  for (let t = 0; t < turns; t++) {
    const hw = startHalfW - t * pitch;
    const hh = startHalfH - t * pitch;
    const r = Math.max(0.12, cornerRadius - t * 0.03);
    const nextHw = hw - pitch;

    const corners = [
      { cx: hw - r, cz: hh - r, a0: 0, a1: Math.PI / 2 },
      { cx: -hw + r, cz: hh - r, a0: Math.PI / 2, a1: Math.PI },
      { cx: -hw + r, cz: -hh + r, a0: Math.PI, a1: (3 * Math.PI) / 2 },
      { cx: hw - r, cz: -hh + r, a0: (3 * Math.PI) / 2, a1: 2 * Math.PI },
    ];

    for (let c = 0; c < corners.length; c++) {
      const corner = corners[c];
      const steps = 5;
      for (let s = 0; s <= steps; s++) {
        const angle = corner.a0 + ((corner.a1 - corner.a0) * s) / steps;
        points.push(
          new THREE.Vector3(
            corner.cx + Math.cos(angle) * r,
            0,
            corner.cz + Math.sin(angle) * r,
          ),
        );
      }
    }

    if (t < turns - 1) {
      points.push(new THREE.Vector3(nextHw, 0, 0));
    }
  }

  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
};

export const buildPhoneCoilCurve = (): THREE.CatmullRomCurve3 => {
  const points: THREE.Vector3[] = [];
  const turns = 4.5;
  const segments = 120;
  const rOuter = 1.95;
  const rInner = 1.15;

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const angle = u * turns * Math.PI * 2;
    const radius = rOuter - u * (rOuter - rInner);
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
};

interface CoilProps {
  variant: CoilVariant;
  position?: [number, number, number];
  emissiveIntensity?: number;
  dimFactor?: number;
}

export const Coil: React.FC<CoilProps> = ({
  variant,
  position = [0, 0, 0],
  emissiveIntensity = 0,
  dimFactor = 1,
}) => {
  const geometry = useMemo(() => {
    const curve = variant === 'rectangular' ? buildCardCoilCurve() : buildPhoneCoilCurve();
    const tubularSegments = variant === 'rectangular' ? 210 : 160;
    const radius = variant === 'rectangular' ? 0.036 : 0.042;
    return new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
  }, [variant]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const effectiveEmissive = Math.max(0, emissiveIntensity * dimFactor);

  return (
    <mesh position={position} geometry={geometry}>
      <meshStandardMaterial
        color={theme.surfaceLight}
        metalness={0.76}
        roughness={0.46}
        emissive={theme.current}
        emissiveIntensity={effectiveEmissive}
      />
    </mesh>
  );
};
