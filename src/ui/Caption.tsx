import React from 'react';
import { Easing, interpolate } from 'remotion';
import { COLORS, FONTS, FONT_SIZE, SAFE_AREA } from '../theme';

interface CaptionProps {
  text: string;
  localFrame: number;
  enterFrame: number;
  exitFrame: number;
  accentColor?: string;
}

export const Caption: React.FC<CaptionProps> = ({
  text,
  localFrame,
  enterFrame,
  exitFrame,
  accentColor = COLORS.TEXT_PRIMARY,
}) => {
  if (localFrame < enterFrame || localFrame > exitFrame) {
    return null;
  }

  const enterProgress = interpolate(localFrame, [enterFrame, enterFrame + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const exitProgress = interpolate(localFrame, [exitFrame - 10, exitFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const opacity = Math.min(enterProgress, exitProgress);
  const translateY = interpolate(enterProgress, [0, 1], [24, 0]);
  const ruleWidth = interpolate(enterProgress, [0, 1], [0, 96]);

  return (
    <div
      style={{
        position: 'absolute',
        top: SAFE_AREA.TOP,
        left: SAFE_AREA.LEFT,
        right: SAFE_AREA.RIGHT,
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: ruleWidth,
          height: 5,
          backgroundColor: accentColor,
          marginBottom: 18,
        }}
      />
      <div
        style={{
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.TITLE,
          fontWeight: 700,
          lineHeight: 1.04,
          letterSpacing: '-0.025em',
          color: COLORS.TEXT_PRIMARY,
        }}
      >
        {text}
      </div>
    </div>
  );
};
