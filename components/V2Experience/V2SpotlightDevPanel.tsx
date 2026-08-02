'use client';

import { useState } from 'react';

import {
  type V2SpotlightNumericSettingKey,
  type V2SpotlightSettings
} from './v2-spotlight.settings';

interface SpotlightControl {
  format: (value: number) => string;
  key: V2SpotlightNumericSettingKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

const controls: SpotlightControl[] = [
  {
    key: 'radius',
    label: 'Blob size',
    min: 80,
    max: 420,
    step: 4,
    format: (value) => `${value}px`
  },
  {
    key: 'blobStretch',
    label: 'Blob stretch',
    min: 0,
    max: 160,
    step: 2,
    format: (value) => `${value}px`
  },
  {
    key: 'revealCore',
    label: 'Solid reveal',
    min: 0,
    max: 90,
    step: 1,
    format: (value) => `${value}%`
  },
  {
    key: 'fadeDuration',
    label: 'Fade duration',
    min: 0,
    max: 1200,
    step: 20,
    format: (value) => `${value}ms`
  },
  {
    key: 'idleHideDelay',
    label: 'Extra hide delay',
    min: 0,
    max: 5000,
    step: 100,
    format: (value) => `${value}ms`
  },
  {
    key: 'questionZoneWidth',
    label: 'Question zone width',
    min: 80,
    max: 500,
    step: 4,
    format: (value) => `${value}px`
  },
  {
    key: 'questionZoneHeight',
    label: 'Question zone height',
    min: 80,
    max: 500,
    step: 4,
    format: (value) => `${value}px`
  },
  {
    key: 'gap',
    label: 'Image gap',
    min: 0,
    max: 24,
    step: 1,
    format: (value) => `${value}px`
  },
  {
    key: 'tileRadius',
    label: 'Image radius',
    min: 0,
    max: 48,
    step: 1,
    format: (value) => `${value}px`
  },
  {
    key: 'saturation',
    label: 'Image saturation',
    min: 0,
    max: 160,
    step: 1,
    format: (value) => `${value}%`
  },
  {
    key: 'contrast',
    label: 'Image contrast',
    min: 50,
    max: 160,
    step: 1,
    format: (value) => `${value}%`
  }
];

export default function V2SpotlightDevPanel({
  isFullIntroEnabled,
  onChange,
  onFullIntroEnabledChange,
  onReplayIntro,
  onReset,
  settings
}: {
  isFullIntroEnabled: boolean;
  onChange: (key: V2SpotlightNumericSettingKey, value: number) => void;
  onFullIntroEnabledChange: (isEnabled: boolean) => void;
  onReplayIntro: () => void;
  onReset: () => void;
  settings: V2SpotlightSettings;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        className='fixed top-4 left-4 z-[12000] cursor-pointer rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 hover:text-white'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        Spotlight controls
      </button>
    );
  }

  return (
    <aside
      data-v2-dev-control='true'
      className='fixed top-4 left-4 z-[12000] max-h-[calc(100dvh-2rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-white/15 bg-zinc-950/90 p-4 text-zinc-100 shadow-2xl backdrop-blur-md'
    >
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-xs leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase'>
            Spotlight controls
          </h2>
          <p className='mt-1.5 text-[10px] leading-none text-zinc-500'>
            Reveal, mosaic, and intro preview
          </p>
        </div>
        <button
          aria-label='Close spotlight controls'
          className='cursor-pointer rounded-sm border border-white/15 px-2 py-1 text-[10px] leading-none text-zinc-400 transition-colors hover:border-white/30 hover:text-white'
          type='button'
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>

      <div className='mt-4 rounded-sm border border-white/10 bg-black/20 p-3'>
        <label className='flex cursor-pointer items-center justify-between gap-4'>
          <span>
            <span className='block text-[11px] leading-none text-zinc-300'>
              Play full initial animation
            </span>
            <span className='mt-1.5 block text-[10px] leading-tight text-zinc-500'>
              Toggle on to restart from waving hand
            </span>
          </span>
          <input
            checked={isFullIntroEnabled}
            className='size-4 shrink-0 cursor-pointer accent-zinc-100'
            type='checkbox'
            onChange={(event) => onFullIntroEnabledChange(event.target.checked)}
          />
        </label>

        <button
          className='mt-3 w-full cursor-pointer rounded-md border border-white/15 px-3 py-2 text-xs text-zinc-300 transition-colors enabled:hover:border-white/30 enabled:hover:bg-white enabled:hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-35'
          disabled={!isFullIntroEnabled}
          type='button'
          onClick={onReplayIntro}
        >
          Replay full intro
        </button>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2'>
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
        Reset spotlight defaults
      </button>
    </aside>
  );
}
