import type { Metadata } from 'next';

import V2Experience from '@/components/V2Experience/V2Experience';
import { getAllProjects } from '@/lib/projects';
import { getAllV2Writings } from '@/lib/v2-writings';

export const metadata: Metadata = {
  alternates: {
    canonical: '/writings'
  },
  description: 'Writing by Sudesh Das about software, products, and craft.',
  openGraph: {
    description: 'Writing by Sudesh Das about software, products, and craft.',
    images: [
      {
        alt: 'Writings by Sudesh Das',
        height: 630,
        url: '/writings/opengraph-image',
        width: 1200
      }
    ],
    siteName: 'Dash',
    title: 'Writings by Sudesh Das',
    type: 'website',
    url: '/writings'
  },
  twitter: {
    card: 'summary_large_image',
    description: 'Writing by Sudesh Das about software, products, and craft.',
    images: ['/writings/twitter-image'],
    title: 'Writings by Sudesh Das'
  },
  title: 'Writings'
};

export default async function WritingsPage() {
  const [projects, writings] = await Promise.all([
    getAllProjects(),
    getAllV2Writings()
  ]);

  return (
    <V2Experience
      initialWritingsPanelOpen
      playInitialAnimation
      projects={projects}
      skipCornerItemsAnimation
      writings={writings}
    />
  );
}
