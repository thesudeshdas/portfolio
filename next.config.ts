import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/writings/*/opengraph-image': [
      './assets/writings/**/*',
      './public/writings/**/*'
    ]
  },
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.notionusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  eslint: {
    dirs: ['components', 'data', 'types', 'app']
  },
  async redirects() {
    return [
      {
        source: '/code',
        destination: '/projects',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
