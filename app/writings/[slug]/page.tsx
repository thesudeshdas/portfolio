import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import V2Experience from '@/components/V2Experience/V2Experience';
import { getAllProjects } from '@/lib/projects';
import { getAllV2Writings } from '@/lib/v2-writings';

interface IWritingsSlugPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const writings = await getAllV2Writings();

  return writings.map((writing) => ({ slug: writing.slug }));
}

export async function generateMetadata({
  params
}: IWritingsSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const writings = await getAllV2Writings();
  const writing = writings.find((entry) => entry.slug === slug);

  if (!writing) {
    return { title: 'Writing not found' };
  }

  return {
    description: writing.description,
    openGraph: {
      description: writing.description,
      title: writing.title
    },
    title: writing.title
  };
}

export default async function WritingsSlugPage({
  params
}: IWritingsSlugPageProps) {
  const { slug } = await params;
  const [projects, writings] = await Promise.all([
    getAllProjects(),
    getAllV2Writings()
  ]);

  if (!writings.some((writing) => writing.slug === slug)) {
    notFound();
  }

  return (
    <V2Experience
      initialWritingSlug={slug}
      initialWritingsPanelOpen
      playInitialAnimation
      projects={projects}
      skipCornerItemsAnimation
      writings={writings}
    />
  );
}
