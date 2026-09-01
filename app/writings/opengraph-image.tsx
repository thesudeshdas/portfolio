import { ImageResponse } from 'next/og';

export const alt = 'Writings by Sudesh Das';
export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'stretch',
          background: '#0a0a0b',
          color: '#f4f4f5',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          height: '100%',
          justifyContent: 'space-between',
          padding: '72px 80px',
          position: 'relative',
          width: '100%'
        }}
      >
        <div
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,255,255,0.13), transparent 68%)',
            display: 'flex',
            height: '760px',
            position: 'absolute',
            right: '-180px',
            top: '-280px',
            width: '760px'
          }}
        />

        <div
          style={{
            color: '#a1a1aa',
            display: 'flex',
            fontSize: 24,
            letterSpacing: '0.22em',
            textTransform: 'uppercase'
          }}
        >
          Dash / Writings
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 920
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 94,
              fontWeight: 300,
              letterSpacing: '-0.055em',
              lineHeight: 0.92
            }}
          >
            words about software, products & craft
          </div>
          <div
            style={{
              color: '#a1a1aa',
              display: 'flex',
              fontSize: 26,
              marginTop: 38
            }}
          >
            by Sudesh Das
          </div>
        </div>

        <div
          style={{
            background: '#f4f4f5',
            display: 'flex',
            height: 2,
            width: 88
          }}
        />
      </div>
    ),
    size
  );
}
