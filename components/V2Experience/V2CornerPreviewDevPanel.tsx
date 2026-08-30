'use client';

import { useState } from 'react';

export type V2CornerPreviewMode = 'live' | 'work' | 'writings' | 'both';

const previewOptions: Array<{
  label: string;
  value: V2CornerPreviewMode;
}> = [
  { label: 'Live', value: 'live' },
  { label: 'Work initial', value: 'work' },
  { label: 'Writings initial', value: 'writings' },
  { label: 'Both initial', value: 'both' }
];

export default function V2CornerPreviewDevPanel({
  mode,
  onChange,
  revealScale
}: {
  mode: V2CornerPreviewMode;
  onChange: (mode: V2CornerPreviewMode) => void;
  revealScale: number;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        className='fixed top-4 left-4 z-[14000] rounded-sm border border-white/15 bg-zinc-950/95 px-3 py-2 text-sm text-zinc-300 shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 hover:text-white'
        onClick={() => setIsOpen(true)}
        type='button'
      >
        Corner preview
      </button>
    );
  }

  return (
    <aside className='fixed top-4 left-4 z-[14000] w-[min(22rem,calc(100vw-2rem))] rounded-sm border border-white/15 bg-zinc-950/95 p-4 text-zinc-100 shadow-2xl backdrop-blur-md'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-sm font-medium text-zinc-200'>Corner preview</h2>
          <p className='mt-1 text-sm text-zinc-500'>
            Initial reveal size: {revealScale}×
          </p>
        </div>

        <button
          aria-label='Close corner preview'
          className='text-sm text-zinc-500 transition-colors hover:text-white'
          onClick={() => setIsOpen(false)}
          type='button'
        >
          Close
        </button>
      </div>

      <div className='mt-4 grid grid-cols-2 gap-2'>
        {previewOptions.map((option) => {
          const isActive = option.value === mode;

          return (
            <button
              key={option.value}
              aria-pressed={isActive}
              className={`rounded-sm border px-3 py-2 text-sm transition-colors active:scale-[0.98] ${
                isActive
                  ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                  : 'border-white/15 text-zinc-400 hover:border-white/30 hover:text-white'
              }`}
              onClick={() => onChange(option.value)}
              type='button'
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className='mt-3 text-sm text-zinc-600'>
        Preview overrides only Work and Writings. Production stays live.
      </p>
    </aside>
  );
}
