'use client';

import { useState } from 'react';

import { V2_INTRO_EASINGS, type V2IntroSettings } from './v2-intro.settings';

type QuestionSettingKey =
  | 'drawDuration'
  | 'questionDelay'
  | 'questionDotDelay'
  | 'questionSize'
  | 'questionX'
  | 'settleDuration'
  | 'tracerFadeDuration'
  | 'tracerSize';

interface QuestionControl {
  format: (value: number) => string;
  key: QuestionSettingKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

const milliseconds = (value: number) => `${value}ms`;
const percent = (value: number) => `${value}%`;
const rawNumber = (value: number) => String(value);
const viewportHeight = (value: number) => `${value}vh`;

const controls: QuestionControl[] = [
  {
    key: 'questionDelay',
    label: 'Question delay',
    min: 0,
    max: 2000,
    step: 50,
    format: milliseconds
  },
  {
    key: 'questionSize',
    label: 'Question height',
    min: 20,
    max: 65,
    step: 1,
    format: viewportHeight
  },
  {
    key: 'questionX',
    label: 'Question X',
    min: 20,
    max: 80,
    step: 1,
    format: percent
  },
  {
    key: 'drawDuration',
    label: 'Hook draw',
    min: 500,
    max: 4000,
    step: 50,
    format: milliseconds
  },
  {
    key: 'tracerFadeDuration',
    label: 'Tracker fade',
    min: 50,
    max: 500,
    step: 25,
    format: milliseconds
  },
  {
    key: 'tracerSize',
    label: 'Tracker size',
    min: 3,
    max: 12,
    step: 0.5,
    format: rawNumber
  },
  {
    key: 'questionDotDelay',
    label: 'Dot delay',
    min: 0,
    max: 1500,
    step: 50,
    format: milliseconds
  },
  {
    key: 'settleDuration',
    label: 'Question settle',
    min: 100,
    max: 2000,
    step: 50,
    format: milliseconds
  }
];

export default function V2IntroDevPanel({
  onChange,
  onEasingChange,
  onReplay,
  onReset,
  settings
}: {
  onChange: (key: QuestionSettingKey, value: number) => void;
  onEasingChange: (easing: string) => void;
  onReplay: () => void;
  onReset: () => void;
  settings: V2IntroSettings;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        className='fixed top-4 left-4 z-[12000] cursor-pointer rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 hover:text-white'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        Question controls
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
            Question controls
          </h2>
          <p className='mt-1.5 text-[10px] leading-none text-zinc-500'>
            Focus mode · full intro paused
          </p>
        </div>
        <button
          aria-label='Close question controls'
          className='cursor-pointer rounded-sm border border-white/15 px-2 py-1 text-[10px] leading-none text-zinc-400 transition-colors hover:border-white/30 hover:text-white'
          type='button'
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2'>
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
            Travel easing
          </span>
          <select
            className='h-7 w-full cursor-pointer rounded-sm border border-white/15 bg-zinc-950 px-2 text-[11px] text-zinc-200 transition-colors outline-none hover:border-white/30 focus:border-white/40'
            value={settings.easing}
            onChange={(event) => onEasingChange(event.target.value)}
          >
            {V2_INTRO_EASINGS.map((easing) => (
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
          Replay question
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
