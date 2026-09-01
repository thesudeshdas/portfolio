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

  const canonicalPath = `/writings/${slug}`;
  const imagePath = `${canonicalPath}/opengraph-image`;
  const twitterImagePath = `${canonicalPath}/twitter-image`;

  return {
    alternates: {
      canonical: canonicalPath
    },
    authors: [{ name: 'Sudesh Das', url: 'https://www.heywhoisdash.com' }],
    description: writing.description,
    keywords: writing.tags,
    openGraph: {
      authors: ['Sudesh Das'],
      description: writing.description,
      images: [
        {
          alt: `${writing.title} — writing by Sudesh Das`,
          height: 630,
          url: imagePath,
          width: 1200
        }
      ],
      publishedTime: new Date(writing.date).toISOString(),
      siteName: 'Dash',
      tags: writing.tags,
      title: writing.title,
      type: 'article',
      url: canonicalPath
    },
    twitter: {
      card: 'summary_large_image',
      description: writing.description,
      images: [twitterImagePath],
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
  const writing = writings.find((entry) => entry.slug === slug);

  if (!writing) {
    notFound();
  }

  const canonicalUrl = `https://www.heywhoisdash.com/writings/${slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    author: {
      '@type': 'Person',
      name: 'Sudesh Das',
      url: 'https://www.heywhoisdash.com'
    },
    datePublished: new Date(writing.date).toISOString(),
    description: writing.description,
    headline: writing.title,
    image: new URL(writing.image, 'https://www.heywhoisdash.com').toString(),
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c')
        }}
        type='application/ld+json'
      />

      <V2Experience
        initialWritingSlug={slug}
        initialWritingsPanelOpen
        playInitialAnimation
        projects={projects}
        skipCornerItemsAnimation
        writings={writings}
      />
    </>
  );
}
