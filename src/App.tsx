import { Player } from '@remotion/player';
import { EPISODE_FPS, TOTAL_EPISODE_FRAMES, theme } from './lib/EpisodeShell';
import { Main } from './Main';

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          height: 'calc(100vh - 32px)',
          aspectRatio: '1080 / 1920',
          maxWidth: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(138, 151, 166, 0.24)',
          backgroundColor: theme.bg,
        }}
      >
        <Player
          component={Main}
          durationInFrames={TOTAL_EPISODE_FRAMES}
          fps={EPISODE_FPS}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{ width: '100%', height: '100%' }}
          controls
          acknowledgeRemotionLicense
        />
      </div>
    </div>
  );
}
