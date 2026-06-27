import type { PointerEvent as ReactPointerEvent } from 'react';

import { cn } from '@/lib/utils';

import type {
  DevPanelPosition,
  GlobePointOfView,
  RotationDirection,
  V2FlowControl,
  V2FlowStep
} from './v2-globe.types';

type V2ColorToken = {
  name: string;
  hex: string;
  useCase: string;
};

export default function V2DevPanel({
  activeStep,
  currentPov,
  devPanelPosition,
  flowSteps,
  getDisplayZoomFromAltitude,
  handleDevPanelDragEnd,
  handleDevPanelDragMove,
  handleDevPanelDragStart,
  handleSkipInitialTransitionChange,
  handleZoomChange,
  isColorsModalOpen,
  isDevPanelOpen,
  isRotationEnabled,
  isSecondStage,
  maxDisplayZoom,
  maxOutlineDetail,
  maxRotationSpeed,
  minDisplayZoom,
  minOutlineDetail,
  minRotationSpeed,
  onStepChange,
  outlineDetail,
  rotationDirection,
  rotationSpeed,
  setIsColorsModalOpen,
  setIsDevPanelOpen,
  setIsRotationEnabled,
  setOutlineDetail,
  setRotationDirection,
  setRotationSpeed,
  shouldSkipInitialTransition,
  v2ColorTokens
}: {
  activeStep?: V2FlowStep;
  currentPov: GlobePointOfView;
  devPanelPosition: DevPanelPosition | null;
  flowSteps: V2FlowControl[];
  getDisplayZoomFromAltitude: (altitude: number) => number;
  handleDevPanelDragEnd: (event: ReactPointerEvent<HTMLElement>) => void;
  handleDevPanelDragMove: (event: ReactPointerEvent<HTMLElement>) => void;
  handleDevPanelDragStart: (event: ReactPointerEvent<HTMLElement>) => void;
  handleSkipInitialTransitionChange: (isChecked: boolean) => void;
  handleZoomChange: (value: number) => void;
  isColorsModalOpen: boolean;
  isDevPanelOpen: boolean;
  isRotationEnabled: boolean;
  isSecondStage: boolean;
  maxDisplayZoom: number;
  maxOutlineDetail: number;
  maxRotationSpeed: number;
  minDisplayZoom: number;
  minOutlineDetail: number;
  minRotationSpeed: number;
  onStepChange?: (step: V2FlowStep) => void;
  outlineDetail: number;
  rotationDirection: RotationDirection;
  rotationSpeed: number;
  setIsColorsModalOpen: (isOpen: boolean) => void;
  setIsDevPanelOpen: (isOpen: boolean | ((isOpen: boolean) => boolean)) => void;
  setIsRotationEnabled: (isEnabled: boolean) => void;
  setOutlineDetail: (
    detail: number | ((currentDetail: number) => number)
  ) => void;
  setRotationDirection: (direction: RotationDirection) => void;
  setRotationSpeed: (speed: number) => void;
  shouldSkipInitialTransition: boolean;
  v2ColorTokens: V2ColorToken[];
}) {
  return (
    <>
      <button
        type='button'
        aria-label={isDevPanelOpen ? 'Close dev controls' : 'Open dev controls'}
        onClick={() => {
          setIsDevPanelOpen((isOpen) => !isOpen);
        }}
        className='absolute top-16 left-5 z-[12000] grid size-11 place-items-center rounded-full border border-white/15 bg-black/75 text-xs font-semibold tracking-[0.12em] text-white shadow-2xl backdrop-blur-md transition-colors hover:border-white/35 hover:bg-white hover:text-black'
      >
        V2
      </button>

      {isDevPanelOpen && (
        <aside
          data-v2-dev-control='true'
          style={{
            width: '260px',
            ...(devPanelPosition
              ? {
                  top: `${devPanelPosition.y}px`,
                  bottom: 'auto',
                  right: 'auto',
                  left: `${devPanelPosition.x}px`
                }
              : {
                  top: '112px',
                  bottom: 'auto',
                  right: 'auto',
                  left: '20px'
                })
          }}
          className='absolute z-[12000] max-h-[calc(100vh-132px)] overflow-y-auto rounded-md border border-white/15 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-md'
        >
          <div className='mb-4 flex items-center justify-between gap-3'>
            <button
              type='button'
              onPointerDown={handleDevPanelDragStart}
              onPointerMove={handleDevPanelDragMove}
              onPointerUp={handleDevPanelDragEnd}
              onPointerCancel={handleDevPanelDragEnd}
              className='min-h-8 flex-1 cursor-grab touch-none py-1 text-left active:cursor-grabbing'
              aria-label='Drag dev controls'
            >
              <h2 className='text-xs font-medium tracking-[0.22em] text-white/70 uppercase'>
                Dev controls
              </h2>
            </button>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => {
                  setIsColorsModalOpen(true);
                }}
                className='rounded-sm border border-white/15 px-2 py-1 text-[10px] leading-none text-white/60 transition-colors hover:border-white/35 hover:text-white'
              >
                Colors
              </button>
              <span className='rounded-sm border border-white/10 px-2 py-1 text-[10px] leading-none text-white/45'>
                V2
              </span>
            </div>
          </div>

          {flowSteps.length > 0 && activeStep && onStepChange && (
            <div className='mb-5 border-b border-white/10 pb-4'>
              <div className='mb-2 text-xs text-white/65'>Flow</div>
              <div className='grid grid-cols-2 overflow-hidden rounded-md border border-white/15'>
                {flowSteps.map((step) => (
                  <button
                    key={step.id}
                    type='button'
                    onClick={() => {
                      onStepChange(step.id);
                    }}
                    className={cn(
                      'min-h-9 px-3 text-xs transition-colors',
                      activeStep === step.id
                        ? 'bg-white text-black'
                        : 'bg-white/0 text-white/65 hover:bg-white/10',
                      step.id !== flowSteps[0]?.id && 'border-l border-white/15'
                    )}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className='mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4 text-xs text-white/65'>
            <span>Skip initial transition</span>
            <input
              type='checkbox'
              checked={shouldSkipInitialTransition}
              onChange={(event) => {
                handleSkipInitialTransitionChange(event.target.checked);
              }}
              className='h-4 w-4 accent-white'
            />
          </label>

          <label className='block'>
            <span className='mb-2 flex items-center justify-between text-xs text-white/65'>
              <span>Zoom</span>
              <span>{getDisplayZoomFromAltitude(currentPov.altitude)}%</span>
            </span>
            <input
              type='range'
              min={minDisplayZoom}
              max={maxDisplayZoom}
              step='1'
              value={getDisplayZoomFromAltitude(currentPov.altitude)}
              onChange={(event) => {
                handleZoomChange(Number(event.target.value));
              }}
              className='w-full accent-white'
            />
          </label>

          <div className='mt-3 flex items-center justify-between text-xs text-white/65'>
            <span>Stage</span>
            <span>{isSecondStage ? 'Second' : 'First'}</span>
          </div>

          <label className='mt-5 block border-t border-white/10 pt-4'>
            <span className='mb-2 flex items-center justify-between text-xs text-white/65'>
              <span>Map detail</span>
              <span>
                {outlineDetail === maxOutlineDetail
                  ? '10m'
                  : `${outlineDetail}%`}
              </span>
            </span>
            <input
              type='range'
              min={minOutlineDetail}
              max={maxOutlineDetail}
              step='1'
              value={outlineDetail}
              onChange={(event) => {
                setOutlineDetail(Number(event.target.value));
              }}
              className='w-full accent-white'
            />
          </label>

          <div className='mt-5 border-t border-white/10 pt-4'>
            <label className='flex items-center justify-between gap-3 text-xs text-white/65'>
              <span>Rotate globe</span>
              <input
                type='checkbox'
                checked={isRotationEnabled}
                onChange={(event) => {
                  setIsRotationEnabled(event.target.checked);
                }}
                className='h-4 w-4 accent-white'
              />
            </label>

            <label className='mt-4 block'>
              <span className='mb-2 flex items-center justify-between text-xs text-white/65'>
                <span>Rotation speed</span>
                <span>{rotationSpeed.toFixed(1)}x</span>
              </span>
              <input
                type='range'
                min={minRotationSpeed}
                max={maxRotationSpeed}
                step='0.1'
                value={rotationSpeed}
                onChange={(event) => {
                  setRotationSpeed(Number(event.target.value));
                }}
                className='w-full accent-white'
              />
            </label>

            <div className='mt-4'>
              <div className='mb-2 text-xs text-white/65'>Direction</div>
              <div className='grid grid-cols-2 overflow-hidden rounded-md border border-white/15'>
                <button
                  type='button'
                  onClick={() => {
                    setRotationDirection('west');
                  }}
                  className={cn(
                    'min-h-9 px-3 text-xs transition-colors',
                    rotationDirection === 'west'
                      ? 'bg-white text-black'
                      : 'bg-white/0 text-white/65 hover:bg-white/10'
                  )}
                >
                  West
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setRotationDirection('east');
                  }}
                  className={cn(
                    'min-h-9 border-l border-white/15 px-3 text-xs transition-colors',
                    rotationDirection === 'east'
                      ? 'bg-white text-black'
                      : 'bg-white/0 text-white/65 hover:bg-white/10'
                  )}
                >
                  East
                </button>
              </div>
            </div>
          </div>

          <dl className='mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs'>
            <dt className='text-white/45'>Lat</dt>
            <dd className='text-right text-white/80 tabular-nums'>
              {currentPov.lat.toFixed(4)}
            </dd>
            <dt className='text-white/45'>Lng</dt>
            <dd className='text-right text-white/80 tabular-nums'>
              {currentPov.lng.toFixed(4)}
            </dd>
            <dt className='text-white/45'>Alt</dt>
            <dd className='text-right text-white/80 tabular-nums'>
              {currentPov.altitude.toFixed(2)}
            </dd>
          </dl>
        </aside>
      )}

      {isColorsModalOpen && (
        <div
          data-v2-dev-control='true'
          className='fixed inset-0 z-[12001] flex items-center justify-center bg-black/65 p-6 backdrop-blur-sm'
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-label='V2 color table'
            className='w-full max-w-2xl rounded-md border border-white/15 bg-black/90 p-5 text-white shadow-2xl'
          >
            <div className='mb-4 flex items-center justify-between gap-4'>
              <h2 className='text-xs font-medium tracking-[0.22em] text-white/70 uppercase'>
                Colors
              </h2>
              <button
                type='button'
                onClick={() => {
                  setIsColorsModalOpen(false);
                }}
                className='rounded-sm border border-white/15 px-2 py-1 text-xs text-white/65 transition-colors hover:border-white/35 hover:text-white'
              >
                Close
              </button>
            </div>

            <div className='overflow-hidden rounded-md border border-white/10'>
              <table className='w-full border-collapse text-left text-xs'>
                <thead className='bg-white/10 text-white/55'>
                  <tr>
                    <th className='px-3 py-2 font-medium'>Color</th>
                    <th className='px-3 py-2 font-medium'>Hex</th>
                    <th className='px-3 py-2 font-medium'>Use case</th>
                  </tr>
                </thead>
                <tbody>
                  {v2ColorTokens.map((colorToken) => (
                    <tr
                      key={colorToken.name}
                      className='border-t border-white/10 text-white/75'
                    >
                      <td className='px-3 py-2'>
                        <span className='flex items-center gap-2'>
                          <span
                            className='h-3 w-3 shrink-0 rounded-sm border border-white/20'
                            style={{ backgroundColor: colorToken.hex }}
                          />
                          {colorToken.name}
                        </span>
                      </td>
                      <td className='px-3 py-2 font-mono text-white/60'>
                        {colorToken.hex}
                      </td>
                      <td className='px-3 py-2'>{colorToken.useCase}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
