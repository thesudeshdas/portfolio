import type { MetadataRoute } from 'next';

import { getAllV2Writings } from '@/lib/v2-writings';

const siteUrl = 'https://www.heywhoisdash.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const writings = await getAllV2Writings();

  return [
    {
      changeFrequency: 'monthly',
      priority: 0.8,
      url: siteUrl
    },
    {
      changeFrequency: 'weekly',
      priority: 0.9,
      url: `${siteUrl}/writings`
    },
    ...writings.map((writing) => ({
      changeFrequency: 'monthly' as const,
      lastModified: new Date(writing.date),
      priority: 0.8,
      url: `${siteUrl}/writings/${writing.slug}`
    }))
  ];
}
