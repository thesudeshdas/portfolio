'use client';

import { useState } from 'react';

import {
  getV2CornerDelay,
  V2_CORNER_EASINGS,
  type V2CornerAnimationMode,
  type V2CornerNumericSettingKey,
  type V2CornerSettings
} from './v2-corner.settings';

interface CornerControl {
  format: (value: number) => string;
  key: V2CornerNumericSettingKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

const milliseconds = (value: number) => `${value}ms`;
const pixels = (value: number) => `${value}px`;
const percent = (value: number) => `${Math.round(value * 100)}%`;
const scale = (value: number) => `${value}×`;

const controls: CornerControl[] = [
  {
    key: 'firstDelay',
    label: 'First item delay',
    min: 0,
    max: 2000,
    step: 50,
    format: milliseconds
  },
  {
    key: 'staggerDelay',
    label: 'Gap between items',
    min: 0,
    max: 1000,
    step: 25,
    format: milliseconds
  },
  {
    key: 'duration',
    label: 'Animation duration',
    min: 100,
    max: 3000,
    step: 50,
    format: milliseconds
  },
  {
    key: 'slideDistance',
    label: 'Slide distance',
    min: 0,
    max: 200,
    step: 5,
    format: pixels
  },
  {
    key: 'startScale',
    label: 'Starting scale',
    min: 1,
    max: 4,
    step: 0.1,
    format: scale
  },
  {
    key: 'revealScale',
    label: 'Appearing size',
    min: 0.5,
    max: 2,
    step: 0.05,
    format: scale
  },
  {
    key: 'finalDelay',
    label: 'Delay before final fade',
    min: 0,
    max: 3000,
    step: 50,
    format: milliseconds
  },
  {
    key: 'finalOpacity',
    label: 'Final opacity',
    min: 0.1,
    max: 1,
    step: 0.05,
    format: percent
  },
  {
    key: 'finalScale',
    label: 'Final size',
    min: 0.5,
    max: 1,
    step: 0.05,
    format: percent
  },
  {
    key: 'finalTransitionDuration',
    label: 'Final transition',
    min: 0,
    max: 2000,
    step: 50,
    format: milliseconds
  }
];

export default function V2CornerDevPanel({
  onChange,
  onAnimationModeChange,
  onEasingChange,
  onReplay,
  onReset,
  settings
}: {
  onChange: (key: V2CornerNumericSettingKey, value: number) => void;
  onAnimationModeChange: (mode: V2CornerAnimationMode) => void;
  onEasingChange: (easing: string) => void;
  onReplay: () => void;
  onReset: () => void;
  settings: V2CornerSettings;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const socialsDelay = getV2CornerDelay(settings, 1);
  const musicDelay = getV2CornerDelay(settings, 2);

  if (!isOpen) {
    return (
      <button
        className='fixed top-4 left-4 z-[12000] cursor-pointer rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 hover:text-white'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        Corner controls
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
            Corner controls
          </h2>
          <p className='mt-1.5 text-[10px] leading-none text-zinc-500'>
            Completed question · changes replay automatically
          </p>
        </div>
        <button
          aria-label='Close corner controls'
          className='cursor-pointer rounded-sm border border-white/15 px-2 py-1 text-[10px] leading-none text-zinc-400 transition-colors hover:border-white/30 hover:text-white'
          type='button'
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>

      <dl className='mt-4 grid grid-cols-3 gap-2 rounded-sm border border-white/10 bg-black/20 p-2.5 text-[10px]'>
        <div>
          <dt className='text-zinc-500'>Work</dt>
          <dd className='mt-1 font-mono text-zinc-200'>
            {milliseconds(settings.firstDelay)}
          </dd>
        </div>
        <div>
          <dt className='text-zinc-500'>Socials</dt>
          <dd className='mt-1 font-mono text-zinc-200'>
            {milliseconds(socialsDelay)}
          </dd>
        </div>
        <div>
          <dt className='text-zinc-500'>Music</dt>
          <dd className='mt-1 font-mono text-zinc-200'>
            {milliseconds(musicDelay)}
          </dd>
        </div>
      </dl>

      <div className='mt-4 grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2'>
        <label className='block'>
          <span className='mb-1.5 block text-[11px] leading-none text-zinc-400'>
            Animation
          </span>
          <select
            className='h-7 w-full cursor-pointer rounded-sm border border-white/15 bg-zinc-950 px-2 text-[11px] text-zinc-200 transition-colors outline-none hover:border-white/30 focus:border-white/40'
            value={settings.animationMode}
            onChange={(event) =>
              onAnimationModeChange(event.target.value as V2CornerAnimationMode)
            }
          >
            <option value='slide'>Slide + fade</option>
            <option value='scale'>Scale + fade</option>
          </select>
        </label>

        {controls.map((control) => {
          const value = settings[control.key];

          return (
            <label
              key={control.key}
              className='block'
            >
              <span className='mb-1.5 flex items-center justify-between gap-3 text-[11px] leading-none text-zinc-400'>
                <span>{control.label}</span>
                <span className='font-mono text-[10px] text-zinc-200'>
                  {control.format(value)}
                </span>
              </span>
              <input
                className='h-4 w-full cursor-pointer accent-zinc-100'
                max={control.max}
                min={control.min}
                step={control.step}
                type='range'
                value={value}
                onChange={(event) => {
                  onChange(control.key, Number(event.target.value));
                }}
              />
            </label>
          );
        })}

        <label className='block'>
          <span className='mb-1.5 block text-[11px] leading-none text-zinc-400'>
            Easing
          </span>
          <select
            className='h-7 w-full cursor-pointer rounded-sm border border-white/15 bg-zinc-950 px-2 text-[11px] text-zinc-200 transition-colors outline-none hover:border-white/30 focus:border-white/40'
            value={settings.easing}
            onChange={(event) => onEasingChange(event.target.value)}
          >
            {V2_CORNER_EASINGS.map((easing) => (
              <option
                key={easing.label}
                value={easing.value}
              >
                {easing.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className='mt-5 grid grid-cols-2 gap-2'>
        <button
          className='cursor-pointer rounded-md border border-white/15 px-3 py-2 text-xs text-zinc-300 transition-colors hover:border-white/30 hover:bg-white hover:text-zinc-950'
          type='button'
          onClick={onReplay}
        >
          Replay corners
        </button>
        <button
          className='cursor-pointer rounded-md border border-white/15 px-3 py-2 text-xs text-zinc-300 transition-colors hover:border-white/30 hover:bg-white hover:text-zinc-950'
          type='button'
          onClick={onReset}
        >
          Reset defaults
        </button>
      </div>
    </aside>
  );
}
