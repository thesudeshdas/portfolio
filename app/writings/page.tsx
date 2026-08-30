import type { Metadata } from 'next';

import V2Experience from '@/components/V2Experience/V2Experience';
import { getAllProjects } from '@/lib/projects';
import { getAllV2Writings } from '@/lib/v2-writings';

export const metadata: Metadata = {
  description: 'Writing by Sudesh Das about software, products, and craft.',
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
      writings={writings}
    />
  );
}
