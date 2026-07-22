'use client';

import { useState } from 'react';

import {
  type V2WorkHoverNumericSettingKey,
  type V2WorkHoverSettings
} from './v2-work-hover.settings';

interface WorkHoverControl {
  format: (value: number) => string;
  key: V2WorkHoverNumericSettingKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

const milliseconds = (value: number) => `${value}ms`;
const percent = (value: number) => `${value}%`;
const pixels = (value: number) => `${value}px`;
const scale = (value: number) => `${value}×`;

const controls: WorkHoverControl[] = [
  {
    key: 'scale',
    label: 'Hover scale',
    min: 1,
    max: 1.75,
    step: 0.05,
    format: scale
  },
  {
    key: 'duration',
    label: 'Scale duration',
    min: 0,
    max: 1000,
    step: 25,
    format: milliseconds
  },
  {
    key: 'underlineWidth',
    label: 'Underline width',
    min: 10,
    max: 100,
    step: 5,
    format: percent
  },
  {
    key: 'underlineGap',
    label: 'Underline gap',
    min: 0,
    max: 24,
    step: 1,
    format: pixels
  },
  {
    key: 'underlineDuration',
    label: 'Underline duration',
    min: 0,
    max: 1000,
    step: 25,
    format: milliseconds
  }
];

export default function V2WorkHoverDevPanel({
  onChange,
  onReset,
  settings
}: {
  onChange: (key: V2WorkHoverNumericSettingKey, value: number) => void;
  onReset: () => void;
  settings: V2WorkHoverSettings;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        className='fixed top-4 left-4 z-[12000] cursor-pointer rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 hover:text-white'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        Work hover
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
            Work hover
          </h2>
          <p className='mt-1.5 text-[10px] leading-none text-zinc-500'>
            Scale first · underline expands second
          </p>
        </div>
        <button
          aria-label='Close work hover controls'
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
