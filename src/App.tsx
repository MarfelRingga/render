import { Player } from '@remotion/player';
import { Main } from './Main';
import { COLORS, VIDEO_HEIGHT, VIDEO_WIDTH } from './theme';
import { FPS, TOTAL_FRAMES } from './timing';

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: COLORS.BG_TOP,
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
          aspectRatio: `${VIDEO_WIDTH} / ${VIDEO_HEIGHT}`,
          maxWidth: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${COLORS.OVERLAY_BORDER}`,
          backgroundColor: COLORS.BG_TOP,
        }}
      >
        <Player
          component={Main}
          durationInFrames={TOTAL_FRAMES}
          fps={FPS}
          compositionWidth={VIDEO_WIDTH}
          compositionHeight={VIDEO_HEIGHT}
          style={{ width: '100%', height: '100%' }}
          controls
          acknowledgeRemotionLicense
        />
      </div>
    </div>
  );
}
