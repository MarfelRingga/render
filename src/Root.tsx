import React from 'react';
import { Composition } from 'remotion';
import { EPISODE_FPS, TOTAL_EPISODE_FRAMES } from './lib/EpisodeShell';
import { Main } from './Main';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={TOTAL_EPISODE_FRAMES}
      fps={EPISODE_FPS}
      width={1080}
      height={1920}
    />
  );
};
