'use client';

import { useState } from 'react';

import {
  type V2SocialHoverNumericSettingKey,
  type V2SocialHoverSettings
} from './v2-social-hover.settings';

interface SocialHoverControl {
  format: (value: number) => string;
  key: V2SocialHoverNumericSettingKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

const controls: SocialHoverControl[] = [
  {
    key: 'restingStrokeWidth',
    label: 'Resting stroke width',
    min: 0.25,
    max: 2,
    step: 0.05,
    format: (value) => value.toFixed(2)
  },
  {
    key: 'hoverStrokeWidth',
    label: 'Hover stroke width',
    min: 0.25,
    max: 2,
    step: 0.05,
    format: (value) => value.toFixed(2)
  },
  {
    key: 'scale',
    label: 'Hover scale',
    min: 1,
    max: 1.75,
    step: 0.05,
    format: (value) => `${value}×`
  },
  {
    key: 'duration',
    label: 'Transition duration',
    min: 0,
    max: 1000,
    step: 25,
    format: (value) => `${value}ms`
  }
];

export default function V2SocialHoverDevPanel({
  onChange,
  onReset,
  settings
}: {
  onChange: (key: V2SocialHoverNumericSettingKey, value: number) => void;
  onReset: () => void;
  settings: V2SocialHoverSettings;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        className='fixed top-4 left-4 z-[12000] cursor-pointer rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 hover:text-white'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        Social hover
      </button>
    );
  }

  return (
    <aside
      data-v2-dev-control='true'
      className='fixed top-4 left-4 z-[12000] w-[min(22rem,calc(100vw-2rem))] rounded-md border border-white/15 bg-zinc-950/90 p-4 text-zinc-100 shadow-2xl backdrop-blur-md'
    >
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-xs leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase'>
            Social hover
          </h2>
          <p className='mt-1.5 text-[10px] leading-none text-zinc-500'>
            Icon interaction only
          </p>
        </div>
        <button
          aria-label='Close social hover controls'
          className='cursor-pointer rounded-sm border border-white/15 px-2 py-1 text-[10px] leading-none text-zinc-400 transition-colors hover:border-white/30 hover:text-white'
          type='button'
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-y-3'>
        {controls.map((control) => (
          <label
            key={control.key}
            className='block'
          >
            <span className='mb-1.5 flex items-center justify-between gap-3 text-[11px] leading-none text-zinc-400'>
              <span>{control.label}</span>
              <span className='font-mono text-[10px] text-zinc-200'>
                {control.format(settings[control.key])}
              </span>
            </span>
            <input
              className='h-4 w-full cursor-pointer accent-zinc-100'
              max={control.max}
              min={control.min}
              step={control.step}
              type='range'
              value={settings[control.key]}
              onChange={(event) =>
                onChange(control.key, Number(event.target.value))
              }
            />
          </label>
        ))}
      </div>

      <button
        className='mt-5 w-full cursor-pointer rounded-md border border-white/15 px-3 py-2 text-xs text-zinc-300 transition-colors hover:border-white/30 hover:bg-white hover:text-zinc-950'
        type='button'
        onClick={onReset}
      >
        Reset defaults
      </button>
    </aside>
  );
}
