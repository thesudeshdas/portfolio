import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    dirs: ['components', 'data', 'types', 'app']
  }
};

export default nextConfig;
