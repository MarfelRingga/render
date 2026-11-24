import React from 'react';
import { Easing, interpolate } from 'remotion';
import { COLORS, FONTS, FONT_SIZE } from '../theme';

interface LabelProps {
  text: string;
  localFrame: number;
  enterFrame: number;
  exitFrame: number;
  x: number;
  y: number;
  accentColor?: string;
  mono?: boolean;
  align?: 'left' | 'right' | 'center';
  icon?: 'no-battery' | 'none';
}

export const Label: React.FC<LabelProps> = ({
  text,
  localFrame,
  enterFrame,
  exitFrame,
  x,
  y,
  accentColor = COLORS.TEXT_SECONDARY,
  mono = false,
  align = 'left',
  icon = 'none',
}) => {
  if (localFrame < enterFrame || localFrame > exitFrame) {
    return null;
  }

  const enter = interpolate(localFrame, [enterFrame, enterFrame + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const exit = interpolate(localFrame, [exitFrame - 8, exitFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  const opacity = Math.min(enter, exit);
  const translateY = interpolate(enter, [0, 1], [14, 0]);
  const transformX =
    align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0%';

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: `translate(${transformX}, ${translateY}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        pointerEvents: 'none',
      }}
    >
      {icon === 'no-battery' && (
        <svg width={52} height={34} viewBox="0 0 52 34" fill="none">
          <rect
            x={2}
            y={4}
            width={40}
            height={26}
            rx={3}
            stroke={COLORS.WARNING}
            strokeWidth={3}
          />
          <rect x={44} y={11} width={5} height={12} rx={1.5} fill={COLORS.WARNING} />
          <line
            x1={7}
            y1={30}
            x2={37}
            y2={4}
            stroke={COLORS.WARNING}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        </svg>
      )}
      <div
        style={{
          borderLeft: align === 'left' ? `4px solid ${accentColor}` : undefined,
          borderRight: align === 'right' ? `4px solid ${accentColor}` : undefined,
          paddingLeft: align === 'left' ? 16 : 0,
          paddingRight: align === 'right' ? 16 : 0,
          fontFamily: mono ? FONTS.mono : FONTS.sans,
          fontSize: FONT_SIZE.LABEL,
          fontWeight: mono ? 700 : 500,
          lineHeight: 1.15,
          color: accentColor === COLORS.TEXT_SECONDARY ? COLORS.TEXT_PRIMARY : accentColor,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};
