'use client';

import { useState } from 'react';

export type V2IdeaCalloutMode = 'mock' | 'stolen' | null;

interface V2IdeaReturnDevPanelProps {
  calloutTransitionDuration: number;
  calloutMode: V2IdeaCalloutMode;
  onCalloutTransitionChange: (value: number) => void;
  onChange: (value: number) => void;
  onPreviewChange: (mode: V2IdeaCalloutMode) => void;
  onReset: () => void;
  returnDelay: number;
}

export default function V2IdeaReturnDevPanel({
  calloutTransitionDuration,
  calloutMode,
  onCalloutTransitionChange,
  onChange,
  onPreviewChange,
  onReset,
  returnDelay
}: V2IdeaReturnDevPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        className='fixed top-4 left-4 z-[12000] cursor-pointer rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase shadow-2xl backdrop-blur-md'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        Idea return
      </button>
    );
  }

  return (
    <aside
      data-v2-content-cursor='true'
      data-v2-dev-control='true'
      className='fixed top-4 left-4 z-[12000] w-[min(22rem,calc(100vw-2rem))] rounded-md border border-white/15 bg-zinc-950/90 p-4 text-zinc-100 shadow-2xl backdrop-blur-md'
    >
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-xs leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase'>
            Idea not stolen
          </h2>
          <p className='mt-1.5 text-[10px] leading-none text-zinc-500'>
            Time before it returns home
          </p>
        </div>
        <button
          aria-label='Close idea return controls'
          className='cursor-pointer rounded-sm border border-white/15 px-2 py-1 text-[10px] leading-none text-zinc-400 transition-colors hover:border-white/30 hover:text-white'
          type='button'
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>

      <label className='mt-5 block'>
        <span className='mb-2 flex items-center justify-between gap-3 text-[11px] leading-none text-zinc-400'>
          <span>Return delay</span>
          <span className='font-mono text-[10px] text-zinc-200'>
            {(returnDelay / 1000).toFixed(2)}s
          </span>
        </span>
        <input
          aria-label={`Return delay ${(returnDelay / 1000).toFixed(2)}s`}
          className='h-4 w-full cursor-pointer accent-zinc-100'
          max={15000}
          min={500}
          step={250}
          type='range'
          value={returnDelay}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>

      <label className='mt-5 block'>
        <span className='mb-2 flex items-center justify-between gap-3 text-[11px] leading-none text-zinc-400'>
          <span>Callout transition</span>
          <span className='font-mono text-[10px] text-zinc-200'>
            {calloutTransitionDuration}ms
          </span>
        </span>
        <input
          aria-label={`Callout transition ${calloutTransitionDuration}ms`}
          className='h-4 w-full cursor-pointer accent-zinc-100'
          max={1200}
          min={0}
          step={25}
          type='range'
          value={calloutTransitionDuration}
          onChange={(event) =>
            onCalloutTransitionChange(Number(event.target.value))
          }
        />
      </label>

      <div className='mt-5 border-t border-white/10 pt-4'>
        <span className='text-[9px] leading-none font-medium tracking-[0.16em] text-zinc-500 uppercase'>
          Callout preview
        </span>
        <div className='mt-3 grid grid-cols-2 gap-2'>
          <button
            aria-pressed={calloutMode === 'mock'}
            className={`cursor-pointer rounded-md border px-3 py-2 text-[10px] transition-colors ${
              calloutMode === 'mock'
                ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                : 'border-white/15 text-zinc-300 hover:border-white/30'
            }`}
            type='button'
            onClick={() => onPreviewChange('mock')}
          >
            Not stolen
          </button>
          <button
            aria-pressed={calloutMode === 'stolen'}
            className={`cursor-pointer rounded-md border px-3 py-2 text-[10px] transition-colors ${
              calloutMode === 'stolen'
                ? 'border-zinc-100 bg-zinc-100 text-zinc-950'
                : 'border-white/15 text-zinc-300 hover:border-white/30'
            }`}
            type='button'
            onClick={() => onPreviewChange('stolen')}
          >
            Ideas stolen
          </button>
        </div>
        <button
          className='mt-2 w-full cursor-pointer rounded-md border border-white/15 px-3 py-2 text-[10px] text-zinc-400 transition-colors hover:border-white/30 hover:text-white disabled:cursor-default disabled:opacity-30'
          disabled={calloutMode === null}
          type='button'
          onClick={() => onPreviewChange(null)}
        >
          Hide callout
        </button>
      </div>

      <button
        className='mt-5 w-full cursor-pointer rounded-md border border-white/15 px-3 py-2 text-xs text-zinc-300 transition-colors hover:border-white/30 hover:bg-white hover:text-zinc-950'
        type='button'
        onClick={onReset}
      >
        Reset default
      </button>
    </aside>
  );
}
