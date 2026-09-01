/* eslint-disable @next/next/no-img-element */
import { promises as fs } from 'fs';
import path from 'path';

import { ImageResponse } from 'next/og';

import { getAllV2Writings } from '@/lib/v2-writings';

export const alt = 'Writing by Sudesh Das';
export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric'
  }).format(new Date(date));
}

function getTitleSize(title: string) {
  if (title.length > 64) {
    return 58;
  }

  if (title.length > 38) {
    return 70;
  }

  return 86;
}

export default async function OpenGraphImage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const writings = await getAllV2Writings();
  const writing = writings.find((entry) => entry.slug === slug);

  if (!writing) {
    return new ImageResponse(
      (
        <div
          style={{
            alignItems: 'center',
            background: '#0a0a0b',
            color: '#f4f4f5',
            display: 'flex',
            fontFamily: 'sans-serif',
            fontSize: 72,
            height: '100%',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          Writing by Sudesh Das
        </div>
      ),
      size
    );
  }

  const coverPath = path.join(
    process.cwd(),
    'public',
    writing.image.replace(/^\//, '')
  );
  const cover = await fs.readFile(coverPath);
  const extension = path.extname(coverPath).toLowerCase();
  const mediaType = extension === '.png' ? 'image/png' : 'image/jpeg';
  const coverDataUrl = `data:${mediaType};base64,${cover.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0b',
          color: '#fafafa',
          display: 'flex',
          fontFamily: 'sans-serif',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          width: '100%'
        }}
      >
        <img
          alt=''
          src={coverDataUrl}
          style={{
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            width: '100%'
          }}
        />
        <div
          style={{
            background:
              'linear-gradient(90deg, rgba(5,5,6,0.97) 0%, rgba(5,5,6,0.88) 47%, rgba(5,5,6,0.22) 100%)',
            display: 'flex',
            height: '100%',
            position: 'absolute',
            width: '100%'
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
            padding: '64px 72px',
            position: 'relative',
            width: '100%'
          }}
        >
          <div
            style={{
              color: '#d4d4d8',
              display: 'flex',
              fontSize: 22,
              letterSpacing: '0.2em',
              textTransform: 'uppercase'
            }}
          >
            Dash / Writings
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 790
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: getTitleSize(writing.title),
                fontWeight: 300,
                letterSpacing: '-0.05em',
                lineHeight: 0.98
              }}
            >
              {writing.title}
            </div>
            <div
              style={{
                color: '#d4d4d8',
                display: 'flex',
                fontSize: 24,
                marginTop: 30
              }}
            >
              {formatDate(writing.date)} · {writing.readingMinutes} min read
            </div>
          </div>

          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              fontSize: 24,
              justifyContent: 'space-between'
            }}
          >
            <span style={{ color: '#e4e4e7' }}>Sudesh Das</span>
            <span style={{ color: '#a1a1aa' }}>heywhoisdash.com</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
