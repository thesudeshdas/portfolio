import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

import type { V2GlobeLocation } from './v2-globe-locations';

type V2LocationContentLayout = {
  modalHeight: number;
  modalLeft: number;
  modalTop: number;
  modalWidth: number;
};

const locationStoryCopy: Record<
  string,
  {
    lead: string;
    note: string;
    caption: string;
  }
> = {
  'birth-jorhat': {
    lead: 'Tea gardens, monsoon air, family stories, the first coordinates on the map.',
    note: 'A place I know through memory, photographs, and the way home gets described before you can name it yourself.',
    caption: 'origin note'
  },
  'childhood-kanpur': {
    lead: 'Long summers, school routes, dusty evenings, the city where early ambition got language.',
    note: 'Kanpur sits in the archive as motion before direction, small rituals before larger choices.',
    caption: 'early years'
  },
  'teenage-cuttack': {
    lead: 'The teenage home, where friendships, confidence, and the first version of independence took shape.',
    note: 'Cuttack was rhythm: lanes, tuition runs, festival noise, late discoveries, and a lot of becoming.',
    caption: 'home layer'
  },
  'first-long-ride-munnar': {
    lead: 'The first long ride: hills opening up, roads folding in, distance becoming a kind of proof.',
    note: 'Munnar felt like permission to leave the map view and enter the terrain.',
    caption: 'ride log'
  },
  'first-solo-br-hills': {
    lead: 'The first solo ride, quiet roads, forest edges, and the useful silence of being alone.',
    note: 'BR Hills marks a shift from waiting for company to trusting the route.',
    caption: 'solo field note'
  },
  'brother-resides-pune': {
    lead: 'A city tied to family, visits, borrowed rooms, and the comfort of having someone close by.',
    note: 'Pune lives here as a waypoint, less about arrival and more about connection.',
    caption: 'family marker'
  },
  'penukonda-fort': {
    lead: 'Stone, heat, height, and a fort that turns a short ride into an old-world pause.',
    note: 'Penukonda is one of those places that makes scale feel physical.',
    caption: 'fort stop'
  },
  'road-trip-udupi': {
    lead: 'Coastal roads, temple streets, food stops, sea air, and the easy logic of a road trip.',
    note: 'Udupi belongs to the travel archive as a soft landing after distance.',
    caption: 'coastal run'
  }
};

function getLocationStoryCopy(location: V2GlobeLocation) {
  return (
    locationStoryCopy[location.id] ?? {
      lead: 'A marker from the route: part memory, part geography, part reason to keep moving.',
      note: 'This place holds a small chapter in the story and a useful coordinate on the map.',
      caption: 'field note'
    }
  );
}

function getLocationImageStyle(locationId: string, index: number) {
  const seed = Array.from(locationId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );
  const x = (seed + index * 23) % 100;
  const y = (seed + index * 37) % 100;

  return {
    backgroundBlendMode: 'screen, multiply, normal',
    backgroundImage:
      'linear-gradient(140deg, rgba(216, 199, 170, 0.42), rgba(47, 29, 19, 0.18)), radial-gradient(circle at 28% 22%, rgba(255, 246, 221, 0.52), transparent 34%), url(/textures/earth-blue-marble.jpg)',
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: 'auto, auto, 260%'
  } satisfies CSSProperties;
}

export default function V2LocationContentPanel({
  closeLocationContent,
  isLocationContentVisible,
  locationContentLayout,
  locationContentProgress,
  selectedLocation
}: {
  closeLocationContent: () => void;
  isLocationContentVisible: boolean;
  locationContentLayout: V2LocationContentLayout;
  locationContentProgress: number;
  selectedLocation: V2GlobeLocation;
}) {
  const storyCopy = getLocationStoryCopy(selectedLocation);

  return (
    <div className='pointer-events-none absolute inset-0 z-[11000]'>
      <button
        type='button'
        aria-label='Close location content'
        onClick={closeLocationContent}
        className='pointer-events-auto absolute inset-0 bg-[#2f1d13] backdrop-blur-[2px]'
        style={{
          opacity: locationContentProgress * 0.35
        }}
      />
      <article
        data-v2-content-cursor='true'
        className='pointer-events-auto absolute overflow-visible'
        style={{
          clipPath: `inset(${(1 - locationContentProgress) * 50}% 0 ${
            (1 - locationContentProgress) * 50
          }% 0)`,
          color: '#2f1d13',
          height: `${locationContentLayout.modalHeight}px`,
          left: `${locationContentLayout.modalLeft}px`,
          top: `${locationContentLayout.modalTop}px`,
          width: `${locationContentLayout.modalWidth}px`
        }}
      >
        <div
          className={cn(
            'relative h-full w-full transition-opacity duration-100',
            isLocationContentVisible && locationContentProgress >= 0.9
              ? 'opacity-100'
              : 'opacity-0'
          )}
        >
          <div className='absolute top-[6%] left-[4%] h-[48%] w-[37%] overflow-hidden bg-[#2f1d13]/10 shadow-2xl'>
            <div
              aria-label={`${selectedLocation.location} placeholder`}
              className='h-full w-full opacity-90 grayscale-[0.18] sepia-[0.35]'
              role='img'
              style={getLocationImageStyle(selectedLocation.id, 1)}
            />
          </div>

          <div className='absolute top-[39%] left-[31%] h-[24%] w-[21%] overflow-hidden bg-[#2f1d13]/10 shadow-xl'>
            <div
              aria-label={`${selectedLocation.location} texture placeholder`}
              className='h-full w-full opacity-85 grayscale sepia-[0.45]'
              role='img'
              style={getLocationImageStyle(selectedLocation.id, 2)}
            />
          </div>

          <div className='absolute bottom-[9%] left-[9%] h-[20%] w-[18%] overflow-hidden bg-[#2f1d13]/10 shadow-xl'>
            <div
              aria-label={`${selectedLocation.location} memory placeholder`}
              className='h-full w-full opacity-[0.82] grayscale-[0.55] sepia-[0.5]'
              role='img'
              style={getLocationImageStyle(selectedLocation.id, 3)}
            />
          </div>

          <div className='absolute top-[7%] right-[7%] z-10 w-[43%] border-l border-[#2f1d13]/25 bg-[#e2d0ae] py-7 pr-13 pl-7 shadow-[0_20px_70px_rgba(47,29,19,0.08)] backdrop-blur-[2px]'>
            <p
              className='mb-5 text-[11px] font-semibold tracking-[0.28em] text-current uppercase'
              style={{ color: '#2f1d13' }}
            >
              {storyCopy.caption}
            </p>
            <h2
              className='text-4xl leading-[1.05] font-semibold tracking-normal'
              style={{ color: '#2f1d13' }}
            >
              {selectedLocation.title}
            </h2>
            <p
              className='mt-3 text-xl leading-snug font-semibold'
              style={{ color: '#2f1d13' }}
            >
              {selectedLocation.location}
            </p>
            {selectedLocation.date && (
              <p
                className='mt-3 font-mono text-xs text-current'
                style={{ color: '#2f1d13' }}
              >
                {selectedLocation.date}
              </p>
            )}
          </div>

          <div className='absolute top-[42%] right-[9%] z-10 w-[39%] bg-[#e2d0ae] px-6 py-5 shadow-[0_14px_52px_rgba(47,29,19,0.08)] backdrop-blur-[2px]'>
            <p
              className='text-2xl leading-snug font-semibold'
              style={{ color: '#2f1d13' }}
            >
              {storyCopy.lead}
            </p>
          </div>

          <div className='absolute right-[13%] bottom-[13%] z-10 w-[33%] border-t border-[#2f1d13]/25 bg-[#e2d0ae] pt-5 backdrop-blur-[1px]'>
            <p
              className='text-sm leading-[1.8] text-current'
              style={{ color: '#2f1d13' }}
            >
              {storyCopy.note}
            </p>
          </div>

          <dl className='absolute bottom-[4%] left-[34%] grid w-[27%] grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-t border-[#2f1d13]/25 bg-[#e2d0ae] pt-4 font-mono text-[11px] text-current backdrop-blur-[1px]'>
            <dt>coords</dt>
            <dd className='text-right'>{selectedLocation.coordinates}</dd>
            <dt>focus</dt>
            <dd className='text-right'>{selectedLocation.focusView.zoom}%</dd>
          </dl>

          <button
            type='button'
            onClick={closeLocationContent}
            className='absolute top-[7%] right-[7%] z-20 grid size-9 place-items-center border border-[#2f1d13]/35 bg-[#e2d0ae] text-lg leading-none text-current backdrop-blur-sm transition-colors hover:bg-[#2f1d13] hover:text-[#d8c7aa]'
            aria-label='Close location content'
          >
            ×
          </button>
        </div>
      </article>
    </div>
  );
}
