import { cn } from '@/lib/utils';

import type { V2GlobeLocation } from './v2-globe-locations';

type V2LocationContentLayout = {
  modalHeight: number;
  modalLeft: number;
  modalTop: number;
  modalWidth: number;
};

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
        className='pointer-events-auto absolute overflow-hidden border border-[#2f1d13]/30 bg-[#d8c7aa]/50 p-8 text-[#2f1d13] shadow-2xl backdrop-blur-sm'
        style={{
          clipPath: `inset(${(1 - locationContentProgress) * 50}% 0 ${
            (1 - locationContentProgress) * 50
          }% 0)`,
          height: `${locationContentLayout.modalHeight}px`,
          left: `${locationContentLayout.modalLeft}px`,
          top: `${locationContentLayout.modalTop}px`,
          width: `${locationContentLayout.modalWidth}px`
        }}
      >
        <div
          className={cn(
            'relative transition-opacity duration-100',
            isLocationContentVisible && locationContentProgress >= 0.9
              ? 'opacity-100'
              : 'opacity-0'
          )}
        >
          <div className='mb-5 flex items-start justify-between gap-4'>
            <div>
              <p className='text-xs font-semibold tracking-[0.22em] uppercase'>
                {selectedLocation.title}
              </p>
              <h2 className='mt-2 text-2xl font-semibold'>
                {selectedLocation.location}
              </h2>
              {selectedLocation.date && (
                <p className='mt-2 text-sm text-[#2f1d13]/65'>
                  {selectedLocation.date}
                </p>
              )}
            </div>
            <button
              type='button'
              onClick={closeLocationContent}
              className='grid size-8 place-items-center border border-[#2f1d13]/30 text-lg leading-none text-[#2f1d13] transition-colors hover:bg-[#2f1d13] hover:text-[#d8c7aa]'
              aria-label='Close location content'
            >
              ×
            </button>
          </div>

          <dl className='grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#2f1d13]/20 pt-6 text-sm'>
            <dt className='text-[#2f1d13]/55'>Coordinates</dt>
            <dd className='text-right font-mono text-[#2f1d13]/80'>
              {selectedLocation.coordinates}
            </dd>
            <dt className='text-[#2f1d13]/55'>Focus</dt>
            <dd className='text-right font-mono text-[#2f1d13]/80'>
              {selectedLocation.focusView.zoom}%
            </dd>
          </dl>
        </div>
      </article>
    </div>
  );
}
