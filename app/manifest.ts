import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'kamkhoj',
    short_name: 'kamkhoj',
    description: 'Find the latest jobs and internships in Nepal',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#B8F460',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}

