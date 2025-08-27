import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    dirs: ['components', 'data', 'types', 'app']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.notionusercontent.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
