import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Main';
import { VIDEO_HEIGHT, VIDEO_WIDTH } from './theme';
import { FPS, TOTAL_FRAMES } from './timing';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
};
