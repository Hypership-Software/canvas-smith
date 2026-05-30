import { ImageResponse } from 'next/og'

/**
 * File-based Open Graph image (R6 §3.0 / §5.2).
 *
 * Minimal and dependency-free: dark `--cm-night` background, a `--cm-spark`
 * accent dot, the large "Canvasmith" wordmark, and the subline. Inline styles
 * only — `next/og` renders this on the edge with system fonts, so we keep the
 * type a clean serif-leaning stack rather than loading a custom font.
 */

export const runtime = 'edge'

export const alt = 'Canvasmith — Canvas-native UI for your AI.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Mirror the site brand tokens (kept inline; ImageResponse has no CSS vars).
const NIGHT = '#0b1020'
const NIGHT_2 = '#121a30'
const SPARK = '#ffa126'
const BLUE_BRIGHT = '#40a0ff'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '96px',
          backgroundColor: NIGHT,
          backgroundImage: `radial-gradient(900px 500px at 78% 18%, ${NIGHT_2}, ${NIGHT})`,
          color: '#ffffff',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: 26,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: BLUE_BRIGHT,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          Claude plugin for Workday Canvas
        </div>

        {/* Wordmark + spark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '26px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              backgroundColor: SPARK,
              boxShadow: `0 0 48px 6px ${SPARK}`,
            }}
          />
          <div
            style={{
              fontSize: 148,
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            Canvasmith
          </div>
        </div>

        {/* Subline */}
        <div
          style={{
            marginTop: '36px',
            fontSize: 44,
            lineHeight: 1.3,
            color: 'rgba(255,255,255,0.78)',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          Canvas-native UI for your AI.
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
