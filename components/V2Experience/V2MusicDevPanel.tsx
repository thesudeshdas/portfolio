'use client';

import { useState } from 'react';

import type {
  V2AlbumBorderVisibility,
  V2MusicPlayerSettings
} from './v2-music.settings';

type MusicSettingKey = Exclude<
  keyof V2MusicPlayerSettings,
  'albumBorderVisibility'
>;

interface MusicControl {
  format: (value: number) => string;
  key: MusicSettingKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

interface MusicControlGroup {
  controls: MusicControl[];
  label: string;
}

const percent = (value: number) => `${Math.round(value * 100)}%`;
const rawPercent = (value: number) => `${value}%`;
const pixels = (value: number) => `${value}px`;
const milliseconds = (value: number) => `${value}ms`;
const seconds = (value: number) => `${value}s`;
const number = (value: number) => String(value);

const controlGroups: MusicControlGroup[] = [
  {
    label: 'Frame',
    controls: [
      {
        key: 'componentScale',
        label: 'Component size',
        min: 0.6,
        max: 1.1,
        step: 0.05,
        format: percent
      },
      {
        key: 'albumRadius',
        label: 'Album corner radius',
        min: 0,
        max: 16,
        step: 1,
        format: pixels
      },
      {
        key: 'albumBorderWidth',
        label: 'Album border width',
        min: 0,
        max: 4,
        step: 0.5,
        format: pixels
      },
      {
        key: 'albumBorderTransitionMs',
        label: 'Border fade duration',
        min: 0,
        max: 1200,
        step: 50,
        format: milliseconds
      }
    ]
  },
  {
    label: 'Vinyl',
    controls: [
      {
        key: 'rotationSeconds',
        label: 'Rotation duration',
        min: 2,
        max: 12,
        step: 0.25,
        format: seconds
      },
      {
        key: 'pausedVinylReveal',
        label: 'Paused reveal',
        min: 0,
        max: 60,
        step: 1,
        format: rawPercent
      },
      {
        key: 'playingVinylReveal',
        label: 'Playing reveal',
        min: 20,
        max: 62.5,
        step: 0.5,
        format: rawPercent
      },
      {
        key: 'vinylSlideMs',
        label: 'Slide duration',
        min: 100,
        max: 2000,
        step: 50,
        format: milliseconds
      },
      {
        key: 'vinylSlideDelayMs',
        label: 'Play slide delay',
        min: 0,
        max: 2000,
        step: 50,
        format: milliseconds
      }
    ]
  },
  {
    label: 'Metadata',
    controls: [
      {
        key: 'metadataTransitionMs',
        label: 'Fade and scale duration',
        min: 100,
        max: 2000,
        step: 50,
        format: milliseconds
      },
      {
        key: 'metadataSlideDistance',
        label: 'Slide distance',
        min: 0,
        max: 64,
        step: 1,
        format: pixels
      },
      {
        key: 'playingMetadataScale',
        label: 'Playing scale',
        min: 0.6,
        max: 1,
        step: 0.05,
        format: percent
      },
      {
        key: 'playingMetadataOpacity',
        label: 'Playing opacity',
        min: 0.1,
        max: 1,
        step: 0.05,
        format: percent
      },
      {
        key: 'hoverMetadataScale',
        label: 'Hover scale',
        min: 0.8,
        max: 1.2,
        step: 0.05,
        format: percent
      },
      {
        key: 'hoverMetadataOpacity',
        label: 'Hover opacity',
        min: 0.4,
        max: 1,
        step: 0.05,
        format: percent
      },
      {
        key: 'metadataGap',
        label: 'Title and artist gap',
        min: 0,
        max: 10,
        step: 1,
        format: pixels
      },
      {
        key: 'songWeight',
        label: 'Song weight',
        min: 300,
        max: 700,
        step: 100,
        format: number
      },
      {
        key: 'artistWeight',
        label: 'Artist weight',
        min: 200,
        max: 600,
        step: 100,
        format: number
      }
    ]
  }
];

export default function V2MusicDevPanel({
  onBorderVisibilityChange,
  onChange,
  onReset,
  settings
}: {
  onBorderVisibilityChange: (visibility: V2AlbumBorderVisibility) => void;
  onChange: (key: MusicSettingKey, value: number) => void;
  onReset: () => void;
  settings: V2MusicPlayerSettings;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        className='fixed top-4 left-4 z-[12000] cursor-pointer rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 hover:text-white'
        type='button'
        onClick={() => setIsOpen(true)}
      >
        Music controls
      </button>
    );
  }

  return (
    <aside className='fixed top-4 left-4 z-[12000] max-h-[70dvh] w-[min(38rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-white/15 bg-zinc-950/90 p-4 text-zinc-100 shadow-2xl backdrop-blur-md'>
      <div className='flex items-center justify-between gap-4'>
        <h2 className='text-xs leading-none font-medium tracking-[0.16em] text-zinc-300 uppercase'>
          Music controls
        </h2>
        <button
          aria-label='Close music controls'
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
            <div className='grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2'>
              {group.controls.map((control) => {
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
              {group.label === 'Frame' ? (
                <label className='block'>
                  <span className='mb-1.5 block text-[11px] leading-none text-zinc-400'>
                    Album border visibility
                  </span>
                  <select
                    className='h-7 w-full cursor-pointer rounded-sm border border-white/15 bg-zinc-950 px-2 text-[11px] text-zinc-200 transition-colors outline-none hover:border-white/30 focus:border-white/40'
                    value={settings.albumBorderVisibility}
                    onChange={(event) => {
                      onBorderVisibilityChange(
                        event.target.value as V2AlbumBorderVisibility
                      );
                    }}
                  >
                    <option value='playing'>While playing</option>
                    <option value='always'>Always</option>
                  </select>
                </label>
              ) : null}
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
