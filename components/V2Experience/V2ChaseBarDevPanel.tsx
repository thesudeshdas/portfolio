'use client';

import { useState } from 'react';

import {
  type V2ChaseBarNumericSettingKey,
  type V2ChaseBarSettings
} from './v2-chase-bar.settings';

interface ChaseBarControl {
  format: (value: number) => string;
  key: V2ChaseBarNumericSettingKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

interface ChaseBarControlGroup {
  controls: ChaseBarControl[];
  label: string;
}

const progressControls: ChaseBarControl[] = [
  {
    key: 'width',
    label: 'Bar width',
    min: 240,
    max: 640,
    step: 10,
    format: (value) => `${value}px`
  },
  {
    key: 'topOffset',
    label: 'Top offset',
    min: 8,
    max: 80,
    step: 1,
    format: (value) => `${value}px`
  },
  {
    key: 'horizontalPadding',
    label: 'Horizontal padding',
    min: 4,
    max: 32,
    step: 1,
    format: (value) => `${value}px`
  },
  {
    key: 'verticalPadding',
    label: 'Vertical padding',
    min: 4,
    max: 24,
    step: 1,
    format: (value) => `${value}px`
  },
  {
    key: 'gap',
    label: 'Content gap',
    min: 4,
    max: 32,
    step: 1,
    format: (value) => `${value}px`
  },
  {
    key: 'trackHeight',
    label: 'Track height',
    min: 1,
    max: 8,
    step: 1,
    format: (value) => `${value}px`
  },
  {
    key: 'transitionDuration',
    label: 'Transition duration',
    min: 0,
    max: 1000,
    step: 25,
    format: (value) => `${value}ms`
  },
  {
    key: 'entranceDistance',
    label: 'Entrance distance',
    min: 0,
    max: 40,
    step: 1,
    format: (value) => `${value}px`
  }
];

const ideaControls: ChaseBarControl[] = [
  {
    key: 'ideaScale',
    label: 'Word scale',
    min: 1,
    max: 3,
    step: 0.05,
    format: (value) => `${value.toFixed(2)}×`
  },
  {
    key: 'ideaMoveDuration',
    label: 'Move duration',
    min: 0,
    max: 1500,
    step: 25,
    format: (value) => `${value}ms`
  },
  {
    key: 'ideaInactivityDuration',
    label: 'Return delay',
    min: 1000,
    max: 15000,
    step: 250,
    format: (value) => `${(value / 1000).toFixed(1)}s`
  },
  {
    key: 'ideaReturnDuration',
    label: 'Return duration',
    min: 0,
    max: 2000,
    step: 25,
    format: (value) => `${value}ms`
  },
  {
    key: 'trembleDuration',
    label: 'Fear duration',
    min: 500,
    max: 6000,
    step: 100,
    format: (value) => `${(value / 1000).toFixed(1)}s`
  },
  {
    key: 'trembleStartAmplitude',
    label: 'Start tremble',
    min: 0,
    max: 12,
    step: 0.5,
    format: (value) => `${value.toFixed(1)}px`
  },
  {
    key: 'trembleEndAmplitude',
    label: 'End tremble',
    min: 1,
    max: 32,
    step: 1,
    format: (value) => `${value}px`
  },
  {
    key: 'trembleFrequency',
    label: 'Tremble speed',
    min: 2,
    max: 30,
    step: 1,
    format: (value) => `${value}Hz`
  }
];

const controlGroups: ChaseBarControlGroup[] = [
  { label: 'Progress bar', controls: progressControls },
  { label: 'Running idea', controls: ideaControls }
];

export default function V2ChaseBarDevPanel({
  onChange,
  onReset,
  settings
}: {
  onChange: (key: V2ChaseBarNumericSettingKey, value: number) => void;
  onReset: () => void;
  settings: V2ChaseBarSettings;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        className='fixed top-4 left-4 z-[12000] cursor-pointer rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 hover:text-white'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        Chase bar
      </button>
    );
  }

  return (
    <aside
      data-v2-content-cursor='true'
      data-v2-dev-control='true'
      className='fixed top-4 left-4 z-[12000] w-[min(22rem,calc(100vw-2rem))] rounded-md border border-white/15 bg-zinc-950/90 p-4 text-zinc-100 shadow-2xl backdrop-blur-md'
    >
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-xs leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase'>
            Chase bar
          </h2>
          <p className='mt-1.5 text-[10px] leading-none text-zinc-500'>
            Bar + running word
          </p>
        </div>
        <button
          aria-label='Close chase bar controls'
          className='cursor-pointer rounded-sm border border-white/15 px-2 py-1 text-[10px] leading-none text-zinc-400 transition-colors hover:border-white/30 hover:text-white'
          type='button'
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>

      <div className='mt-4 grid max-h-[calc(100dvh-9rem)] grid-cols-1 gap-y-5 overflow-y-auto pr-1'>
        {controlGroups.map((group) => (
          <section key={group.label}>
            <h3 className='mb-3 text-[9px] leading-none font-medium tracking-[0.16em] text-zinc-600 uppercase'>
              {group.label}
            </h3>
            <div className='grid grid-cols-1 gap-y-3'>
              {group.controls.map((control) => (
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
          </section>
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
