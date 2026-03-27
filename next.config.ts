import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.notionusercontent.com'
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
