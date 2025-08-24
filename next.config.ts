import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    dirs: ['components', 'data', 'types', 'app']
  },
  env: {
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_TOKEN: process.env.NOTION_TOKEN
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.notion.so',
        port: '',
        pathname: '/images/**'
      }
    ]
  }
};

export default nextConfig;
