import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
