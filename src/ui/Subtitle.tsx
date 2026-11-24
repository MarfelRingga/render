import React from 'react';
import { Easing, interpolate } from 'remotion';
import { COLORS, FONTS, FONT_SIZE, SAFE_AREA } from '../theme';
import { getScenePhraseTimings, SceneDefinition } from '../timing';

interface SubtitleProps {
  scene: SceneDefinition;
  localFrame: number;
}

export const Subtitle: React.FC<SubtitleProps> = ({ scene, localFrame }) => {
  const phrases = getScenePhraseTimings(scene);
  const active = phrases.find(
    (p) => localFrame >= p.startFrame && localFrame < p.endFrame,
  );

  if (!active) {
    return null;
  }

  const fadeIn = interpolate(localFrame, [active.startFrame, active.startFrame + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const fadeOut = interpolate(localFrame, [active.endFrame - 4, active.endFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  const opacity = Math.min(fadeIn, fadeOut);
  const translateY = interpolate(fadeIn, [0, 1], [10, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: SAFE_AREA.SUBTITLE_BOTTOM,
        left: SAFE_AREA.LEFT,
        right: SAFE_AREA.RIGHT,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: COLORS.OVERLAY_SCRIM,
          border: `1px solid ${COLORS.OVERLAY_BORDER}`,
          borderRadius: 6,
          padding: '16px 28px',
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.SUBTITLE,
          fontWeight: 500,
          lineHeight: 1.24,
          color: COLORS.TEXT_PRIMARY,
          textAlign: 'center',
          whiteSpace: 'pre-line',
        }}
      >
        {active.text}
      </div>
    </div>
  );
};
