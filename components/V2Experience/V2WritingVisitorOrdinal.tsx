'use client';

import { useEffect, useState } from 'react';

interface IVisitorResponse {
  ordinal: number;
}

const visitorOrdinalPromises = new Map<string, Promise<number | null>>();

function getVisitorOrdinal(slug: string) {
  const cachedPromise = visitorOrdinalPromises.get(slug);

  if (cachedPromise) return cachedPromise;

  const visitorOrdinalPromise = fetch(
    `/api/visitors/writings/${encodeURIComponent(slug)}`,
    {
      method: 'POST'
    }
  )
    .then(async (response) => {
      if (!response.ok) return null;

      const data = (await response.json()) as IVisitorResponse;
      return data.ordinal;
    })
    .catch(() => {
      visitorOrdinalPromises.delete(slug);
      return null;
    });

  visitorOrdinalPromises.set(slug, visitorOrdinalPromise);

  return visitorOrdinalPromise;
}

export default function V2WritingVisitorOrdinal({ slug }: { slug: string }) {
  const [ordinal, setOrdinal] = useState<number | null>(null);

  useEffect(() => {
    let isCurrentWriting = true;

    setOrdinal(null);

    void getVisitorOrdinal(slug).then((nextOrdinal) => {
      if (isCurrentWriting) setOrdinal(nextOrdinal);
    });

    return () => {
      isCurrentWriting = false;
    };
  }, [slug]);

  return (
    <span
      aria-live='polite'
      className='inline-block min-w-36'
    >
      {ordinal === null ? null : (
        <>
          You’re the{' '}
          <span className='text-[var(--v2-text-strong)]'>
            {formatOrdinal(ordinal)}
          </span>{' '}
          visitor
        </>
      )}
    </span>
  );
}

function formatOrdinal(value: number) {
  const lastTwoDigits = value % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}
