import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    dirs: ['components', 'data', 'types', 'app']
  },
  env: {
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_TOKEN: process.env.NOTION_TOKEN
  }
};

export default nextConfig;
