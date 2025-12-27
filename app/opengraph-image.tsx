import { ImageResponse } from 'next/og'

export const alt = 'JobKhoj - Nepal\'s Job Finder'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🔍</div>
        <div>JobKhoj</div>
        <div style={{ fontSize: 40, marginTop: 20, fontWeight: 'normal' }}>
          Nepal's #1 Job Finder
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

