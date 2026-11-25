import React from 'react';
import { theme } from '../../lib/EpisodeShell';

interface RulerProps {
  baseY: number;
  topY: number;
  opacity: number;
  thresholdCm?: number;
}

export const CentimeterRuler: React.FC<RulerProps> = ({
  baseY,
  topY,
  opacity,
  thresholdCm = 4.2,
}) => {
  if (opacity <= 0.01) return null;

  const maxCm = 10;
  const activeHeight = Math.max(0.2, Math.min(maxCm, topY - baseY));
  const overThreshold = activeHeight >= thresholdCm;
  const barColor = overThreshold ? theme.danger : theme.data;

  return (
    <group position={[-5.1, baseY, 0]}>
      <mesh position={[0, maxCm / 2, 0]}>
        <boxGeometry args={[0.14, maxCm, 0.08]} />
        <meshStandardMaterial
          color={theme.surface}
          metalness={0}
          roughness={0.55}
          transparent
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.16, activeHeight / 2, 0]}>
        <boxGeometry args={[0.08, activeHeight, 0.08]} />
        <meshStandardMaterial
          color={barColor}
          emissive={barColor}
          emissiveIntensity={0.6}
          roughness={0.45}
          metalness={0}
          transparent
          opacity={opacity}
        />
      </mesh>

      {Array.from({ length: maxCm + 1 }, (_, cm) => (
        <mesh key={cm} position={[cm % 5 === 0 ? 0.24 : 0.16, cm, 0]}>
          <boxGeometry args={[cm % 5 === 0 ? 0.36 : 0.2, 0.04, 0.08]} />
          <meshStandardMaterial
            color={theme.textMuted}
            roughness={0.48}
            metalness={0.5}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  );
};
