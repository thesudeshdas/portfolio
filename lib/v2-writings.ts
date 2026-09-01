import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';

import type { IV2Writing } from '@/types/writing/writing.types';

const writingsDirectory = path.join(process.cwd(), 'assets/writings');

function parseFrontmatter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  const metadata: Record<string, string> = {};

  if (!match) {
    return { markdown: source, metadata };
  }

  match[1].split('\n').forEach((line) => {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    metadata[key] = value;
  });

  return {
    markdown: source.slice(match[0].length),
    metadata
  };
}

function parseTags(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function extractMarkdownLinks(...sources: Array<string | undefined>) {
  const linksByUrl = new Map<string, string>();
  const markdownLinkPattern = /\[([^\]]+)]\((https?:\/\/[^)]+)\)/g;

  for (const source of sources) {
    if (!source) continue;

    for (const match of Array.from(source.matchAll(markdownLinkPattern))) {
      const [, label, url] = match;

      if (!linksByUrl.has(url)) {
        linksByUrl.set(url, label.replace(/[*_`]/g, ''));
      }
    }
  }

  return Array.from(linksByUrl, ([url, label]) => ({ label, url }));
}

export async function getAllV2Writings(): Promise<IV2Writing[]> {
  const filenames = (await fs.readdir(writingsDirectory)).filter((filename) =>
    filename.endsWith('.md')
  );
  const writings = await Promise.all(
    filenames.map(async (filename) => {
      const source = await fs.readFile(
        path.join(writingsDirectory, filename),
        'utf8'
      );
      const { markdown, metadata } = parseFrontmatter(source);
      const wordCount = markdown.trim().split(/\s+/).filter(Boolean).length;

      return {
        attribution: metadata.attribution,
        date: metadata.date,
        description: metadata.description,
        image: metadata.image,
        imageAlt: metadata.imageAlt,
        links: extractMarkdownLinks(markdown, metadata.attribution),
        markdown,
        readingMinutes: Math.max(1, Math.ceil(wordCount / 220)),
        slug: filename.replace(/\.md$/, ''),
        tags: parseTags(metadata.tags),
        title: metadata.title
      };
    })
  );

  return writings.sort(
    (first, second) =>
      new Date(second.date).getTime() - new Date(first.date).getTime()
  );
}
