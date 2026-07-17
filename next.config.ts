import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.notionusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co'
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
