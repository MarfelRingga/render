import React from 'react';
import { Easing, interpolate } from 'remotion';
import { fonts, safe, theme, type, useScene } from '../../lib/EpisodeShell';

const SAFE_TOP_ZONE_MAX_Y = Math.round(1920 * 0.3);

interface TitleProps {
  sceneIndex: number;
  text: string;
  enterAtSpeech: number;
  exitAtProgress?: number;
  accentColor?: string;
}

export const ScreenTitle: React.FC<TitleProps> = ({
  sceneIndex,
  text,
  enterAtSpeech,
  exitAtProgress = 0.9,
  accentColor = theme.text,
}) => {
  const scene = useScene(sceneIndex);
  if (!scene.active) return null;

  const enterFrame = Math.round(enterAtSpeech * scene.speechFrames) + 8;
  const exitFrame = Math.min(scene.frames - 6, Math.round(exitAtProgress * scene.frames));
  if (scene.local < enterFrame || scene.local > exitFrame) return null;

  const enter = interpolate(scene.local, [enterFrame, enterFrame + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const exit = interpolate(scene.local, [exitFrame - 10, exitFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const opacity = Math.min(enter, exit);
  const translateY = interpolate(enter, [0, 1], [20, 0]);
  const barWidth = interpolate(enter, [0, 1], [0, 88]);

  return (
    <div
      style={{
        position: 'absolute',
        top: safe.top,
        left: safe.side,
        right: safe.side,
        maxHeight: SAFE_TOP_ZONE_MAX_Y - safe.top,
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: barWidth,
          height: 5,
          backgroundColor: accentColor,
          marginBottom: 16,
        }}
      />
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: type.title,
          fontWeight: 700,
          lineHeight: 1.04,
          letterSpacing: '-0.025em',
          color: theme.text,
        }}
      >
        {text}
      </div>
    </div>
  );
};

interface ScreenLabelProps {
  sceneIndex: number;
  text: string;
  enterAtSpeech: number;
  staggerFrames?: number;
  exitAtProgress?: number;
  row?: 0 | 1;
  accentColor?: string;
  mono?: boolean;
  icon?: 'no-battery' | 'none';
}

export const ScreenLabel: React.FC<ScreenLabelProps> = ({
  sceneIndex,
  text,
  enterAtSpeech,
  staggerFrames = 0,
  exitAtProgress = 0.9,
  row = 0,
  accentColor = theme.textMuted,
  mono = false,
  icon = 'none',
}) => {
  const scene = useScene(sceneIndex);
  if (!scene.active) return null;

  const enterFrame = Math.round(enterAtSpeech * scene.speechFrames) + 8 + staggerFrames;
  const exitFrame = Math.min(scene.frames - 6, Math.round(exitAtProgress * scene.frames));
  if (scene.local < enterFrame || scene.local > exitFrame) return null;

  const enter = interpolate(scene.local, [enterFrame, enterFrame + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const exit = interpolate(scene.local, [exitFrame - 8, exitFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const opacity = Math.min(enter, exit);
  const translateY = interpolate(enter, [0, 1], [12, 0]);
  const topY = row === 0 ? 372 : 444;

  return (
    <div
      style={{
        position: 'absolute',
        top: topY,
        left: safe.side,
        right: safe.side,
        opacity,
        transform: `translateY(${translateY}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        pointerEvents: 'none',
      }}
    >
      {icon === 'no-battery' && (
        <svg width={48} height={32} viewBox="0 0 52 34" fill="none">
          <rect
            x={2}
            y={4}
            width={40}
            height={26}
            rx={3}
            stroke={theme.danger}
            strokeWidth={3}
          />
          <rect x={44} y={11} width={5} height={12} rx={1.5} fill={theme.danger} />
          <line
            x1={7}
            y1={30}
            x2={37}
            y2={4}
            stroke={theme.danger}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </svg>
      )}
      <div
        style={{
          borderLeft: `4px solid ${accentColor}`,
          paddingLeft: 16,
          fontFamily: mono ? fonts.mono : fonts.sans,
          fontSize: type.label,
          fontWeight: mono ? 700 : 500,
          lineHeight: 1.12,
          color: accentColor === theme.textMuted ? theme.text : accentColor,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};
