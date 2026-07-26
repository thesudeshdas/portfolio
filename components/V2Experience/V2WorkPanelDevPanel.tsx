'use client';

import { useState } from 'react';

import type {
  V2WorkPanelDirection,
  V2WorkPanelDirectionSettingKey,
  V2WorkPanelNumericSettingKey,
  V2WorkPanelSettings
} from './v2-work-panel.settings';

interface WorkPanelControl {
  format: (value: number) => string;
  key: V2WorkPanelNumericSettingKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

interface WorkPanelControlGroup {
  controls: WorkPanelControl[];
  label: string;
}

const milliseconds = (value: number) => `${value}ms`;
const degrees = (value: number) => `${value}°`;
const percent = (value: number) => `${value}%`;
const decimal = (value: number) => value.toFixed(2);

const directions: Array<{
  label: string;
  value: V2WorkPanelDirection;
}> = [
  { label: 'Top', value: 'top' },
  { label: 'Top right', value: 'top-right' },
  { label: 'Right', value: 'right' },
  { label: 'Bottom right', value: 'bottom-right' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Bottom left', value: 'bottom-left' },
  { label: 'Left', value: 'left' },
  { label: 'Top left', value: 'top-left' }
];

const controlGroups: WorkPanelControlGroup[] = [
  {
    label: 'Panel',
    controls: [
      {
        key: 'width',
        label: 'Width',
        min: 50,
        max: 100,
        step: 1,
        format: percent
      },
      {
        key: 'height',
        label: 'Height',
        min: 50,
        max: 100,
        step: 1,
        format: percent
      }
    ]
  },
  {
    label: 'Entry',
    controls: [
      {
        key: 'entryDuration',
        label: 'Duration',
        min: 100,
        max: 1500,
        step: 20,
        format: milliseconds
      },
      {
        key: 'entryAngle',
        label: 'Direction offset',
        min: -180,
        max: 180,
        step: 1,
        format: degrees
      },
      {
        key: 'entryBezierX1',
        label: 'Bezier X1',
        min: 0,
        max: 1,
        step: 0.01,
        format: decimal
      },
      {
        key: 'entryBezierY1',
        label: 'Bezier Y1',
        min: -1,
        max: 2,
        step: 0.01,
        format: decimal
      },
      {
        key: 'entryBezierX2',
        label: 'Bezier X2',
        min: 0,
        max: 1,
        step: 0.01,
        format: decimal
      },
      {
        key: 'entryBezierY2',
        label: 'Bezier Y2',
        min: -1,
        max: 2,
        step: 0.01,
        format: decimal
      }
    ]
  },
  {
    label: 'Exit',
    controls: [
      {
        key: 'exitDuration',
        label: 'Duration',
        min: 80,
        max: 1000,
        step: 20,
        format: milliseconds
      },
      {
        key: 'exitAngle',
        label: 'Direction offset',
        min: -180,
        max: 180,
        step: 1,
        format: degrees
      },
      {
        key: 'exitBezierX1',
        label: 'Bezier X1',
        min: 0,
        max: 1,
        step: 0.01,
        format: decimal
      },
      {
        key: 'exitBezierY1',
        label: 'Bezier Y1',
        min: -1,
        max: 2,
        step: 0.01,
        format: decimal
      },
      {
        key: 'exitBezierX2',
        label: 'Bezier X2',
        min: 0,
        max: 1,
        step: 0.01,
        format: decimal
      },
      {
        key: 'exitBezierY2',
        label: 'Bezier Y2',
        min: -1,
        max: 2,
        step: 0.01,
        format: decimal
      }
    ]
  }
];

export default function V2WorkPanelDevPanel({
  onDirectionChange,
  onNumericChange,
  onReset,
  settings
}: {
  onDirectionChange: (
    key: V2WorkPanelDirectionSettingKey,
    value: V2WorkPanelDirection
  ) => void;
  onNumericChange: (key: V2WorkPanelNumericSettingKey, value: number) => void;
  onReset: () => void;
  settings: V2WorkPanelSettings;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        data-v2-content-cursor='true'
        className='fixed top-4 left-4 z-[14000] cursor-pointer rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 hover:text-white'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        Work motion
      </button>
    );
  }

  return (
    <aside
      data-v2-content-cursor='true'
      data-v2-dev-control='true'
      className='fixed top-4 left-4 z-[14000] max-h-[calc(100dvh-2rem)] w-[min(38rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-white/15 bg-zinc-950/95 p-4 text-zinc-100 shadow-2xl backdrop-blur-md'
    >
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-xs leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase'>
            Work motion
          </h2>
          <p className='mt-1.5 text-[10px] leading-none text-zinc-500'>
            Panel and overlay share each timeline
          </p>
        </div>
        <button
          aria-label='Close work motion controls'
          className='cursor-pointer rounded-sm border border-white/15 px-2 py-1 text-[10px] leading-none text-zinc-400 transition-colors hover:border-white/30 hover:text-white'
          type='button'
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>

      <div className='mt-4 space-y-5'>
        {controlGroups.map((group) => (
          <section
            key={group.label}
            className='border-t border-white/10 pt-4'
          >
            <h3 className='mb-3 text-[10px] leading-none font-medium tracking-[0.14em] text-zinc-500 uppercase'>
              {group.label}
            </h3>

            {group.label === 'Entry' || group.label === 'Exit' ? (
              <label className='mb-3 block'>
                <span className='mb-1.5 block text-[11px] leading-none text-zinc-400'>
                  Direction
                </span>
                <select
                  className='h-8 w-full cursor-pointer rounded-sm border border-white/15 bg-zinc-950 px-2 text-[11px] text-zinc-200 transition-colors outline-none hover:border-white/30 focus:border-white/40'
                  value={
                    group.label === 'Entry'
                      ? settings.entryDirection
                      : settings.exitDirection
                  }
                  onChange={(event) => {
                    onDirectionChange(
                      group.label === 'Entry'
                        ? 'entryDirection'
                        : 'exitDirection',
                      event.target.value as V2WorkPanelDirection
                    );
                  }}
                >
                  {directions.map((direction) => (
                    <option
                      key={direction.value}
                      value={direction.value}
                    >
                      {direction.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className='grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2'>
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
                    onChange={(event) => {
                      onNumericChange(control.key, Number(event.target.value));
                    }}
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
