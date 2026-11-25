import React from 'react';
import Episode from './episodes/cara-kerja-nfc/Episode';
import { EpisodeShell } from './lib/EpisodeShell';

export const Main: React.FC = () => {
  return (
    <EpisodeShell>
      <Episode />
    </EpisodeShell>
  );
};
