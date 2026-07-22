'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion
} from 'motion/react';
import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';

import V2ChaseBarDevPanel from './V2ChaseBarDevPanel';
import {
  DEFAULT_V2_CHASE_BAR_SETTINGS,
  IS_V2_CHASE_BAR_DEV_PANEL_ENABLED,
  type V2ChaseBarNumericSettingKey,
  type V2ChaseBarSettings
} from './v2-chase-bar.settings';

const CHASE_CLICKS_REQUIRED = 3;
const CHASE_EDGE_PADDING_PX = 24;
const CHASE_TOP_CLEARANCE_PX = 96;
const CHASE_MIN_DISTANCE_PX = 160;

interface ChasePosition {
  x: number;
  y: number;
}

type CalloutMode = 'mock' | 'stolen';

interface V2AttributionPopoverProps {
  fontClassName: string;
  hoverStyle: CSSProperties;
  isSettled: boolean;
  onHeadlineDimChange: (isDimmed: boolean) => void;
}

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * Math.max(maximum - minimum, 0);
}

function getRandomChasePosition(
  buttonRect: DOMRect,
  buttonWidth: number,
  buttonHeight: number,
  scale: number
): ChasePosition {
  const scaledWidth = buttonWidth * scale;
  const scaledHeight = buttonHeight * scale;
  const maximumX = Math.max(
    0,
    window.innerWidth - scaledWidth - CHASE_EDGE_PADDING_PX
  );
  const maximumY = Math.max(
    0,
    window.innerHeight - scaledHeight - CHASE_EDGE_PADDING_PX
  );
  const minimumX = Math.min(CHASE_EDGE_PADDING_PX, maximumX);
  const minimumY = Math.min(CHASE_TOP_CLEARANCE_PX, maximumY);
  const minimumDistance = Math.min(
    CHASE_MIN_DISTANCE_PX,
    window.innerWidth * 0.25
  );
  let position = {
    x: randomBetween(minimumX, maximumX),
    y: randomBetween(minimumY, maximumY)
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const distance = Math.hypot(
      position.x - buttonRect.left,
      position.y - buttonRect.top
    );

    if (distance >= minimumDistance) {
      return position;
    }

    position = {
      x: randomBetween(minimumX, maximumX),
      y: randomBetween(minimumY, maximumY)
    };
  }

  return position;
}

export default function V2AttributionPopover({
  fontClassName,
  hoverStyle,
  isSettled,
  onHeadlineDimChange
}: V2AttributionPopoverProps) {
  const ideaOriginRef = useRef<HTMLSpanElement | null>(null);
  const calloutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didStealInCurrentChaseRef = useRef(false);
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const movingIdeaRef = useRef<HTMLButtonElement | null>(null);
  const returnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trembleStartedAtRef = useRef<number | null>(null);
  const trembleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trembleX = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();
  const [chaseBarSettings, setChaseBarSettings] = useState<V2ChaseBarSettings>(
    () => ({
      ...DEFAULT_V2_CHASE_BAR_SETTINGS
    })
  );
  const [chaseClicks, setChaseClicks] = useState(0);
  const [chaseOrigin, setChaseOrigin] = useState<ChasePosition | null>(null);
  const [chasePosition, setChasePosition] = useState<ChasePosition | null>(
    null
  );
  const [calloutMode, setCalloutMode] = useState<CalloutMode | null>(null);
  const [ideasStolen, setIdeasStolen] = useState(0);
  const [isChaseActive, setIsChaseActive] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const stopTrembling = useCallback(() => {
    trembleStartedAtRef.current = null;
    trembleX.set(0);

    if (trembleTimeoutRef.current) {
      clearTimeout(trembleTimeoutRef.current);
      trembleTimeoutRef.current = null;
    }
  }, [trembleX]);

  const clearInactivityTimers = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }

    if (returnTimeoutRef.current) {
      clearTimeout(returnTimeoutRef.current);
      returnTimeoutRef.current = null;
    }
  }, []);

  const hideCallout = useCallback(() => {
    if (calloutTimeoutRef.current) {
      clearTimeout(calloutTimeoutRef.current);
      calloutTimeoutRef.current = null;
    }

    setCalloutMode(null);
  }, []);

  const showMockCallout = useCallback(() => {
    hideCallout();
    setCalloutMode('mock');
    calloutTimeoutRef.current = setTimeout(() => {
      calloutTimeoutRef.current = null;
      setCalloutMode(null);
    }, 2600);
  }, [hideCallout]);

  useAnimationFrame(() => {
    const startedAt = trembleStartedAtRef.current;

    if (startedAt === null || shouldReduceMotion) {
      return;
    }

    const elapsed = performance.now() - startedAt;
    const progress = Math.min(elapsed / chaseBarSettings.trembleDuration, 1);
    const amplitude =
      chaseBarSettings.trembleStartAmplitude +
      (chaseBarSettings.trembleEndAmplitude -
        chaseBarSettings.trembleStartAmplitude) *
        progress ** 2;
    const phase =
      (elapsed / 1000) * chaseBarSettings.trembleFrequency * Math.PI * 2;

    trembleX.set(Math.sin(phase) * amplitude);
  });

  const handleChaseBarSettingChange = useCallback(
    (key: V2ChaseBarNumericSettingKey, value: number) => {
      setChaseBarSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value
      }));
    },
    []
  );

  const handleChaseBarReset = useCallback(() => {
    setChaseBarSettings({ ...DEFAULT_V2_CHASE_BAR_SETTINGS });
  }, []);

  const resetChase = useCallback(() => {
    clearInactivityTimers();
    stopTrembling();
    onHeadlineDimChange(false);
    setChaseClicks(0);
    setChaseOrigin(null);
    setChasePosition(null);
    setIsChaseActive(false);
    setIsReturning(false);
  }, [clearInactivityTimers, onHeadlineDimChange, stopTrembling]);

  useEffect(
    () => () => {
      clearInactivityTimers();
      hideCallout();
      stopTrembling();
      onHeadlineDimChange(false);
    },
    [clearInactivityTimers, hideCallout, onHeadlineDimChange, stopTrembling]
  );

  const returnIdeaHome = useCallback(() => {
    if (!chaseOrigin || isReturning) {
      return;
    }

    clearInactivityTimers();
    stopTrembling();
    onHeadlineDimChange(false);
    setIsReturning(true);
    setChasePosition(chaseOrigin);

    const returnDuration = shouldReduceMotion
      ? 0
      : chaseBarSettings.ideaReturnDuration;

    returnTimeoutRef.current = setTimeout(() => {
      const shouldMockUser = !didStealInCurrentChaseRef.current;

      resetChase();

      if (shouldMockUser) {
        showMockCallout();
      }
    }, returnDuration + 50);
  }, [
    chaseBarSettings.ideaReturnDuration,
    chaseOrigin,
    clearInactivityTimers,
    isReturning,
    onHeadlineDimChange,
    resetChase,
    shouldReduceMotion,
    showMockCallout,
    stopTrembling
  ]);

  const scheduleIdeaReturn = useCallback(() => {
    if (isReturning) {
      return;
    }

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(
      returnIdeaHome,
      chaseBarSettings.ideaInactivityDuration
    );
  }, [chaseBarSettings.ideaInactivityDuration, isReturning, returnIdeaHome]);

  useEffect(() => {
    if (isChaseActive && !isReturning) {
      scheduleIdeaReturn();
    }
  }, [isChaseActive, isReturning, scheduleIdeaReturn]);

  useEffect(() => {
    if (!isChaseActive) {
      return;
    }

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && movingIdeaRef.current?.contains(target)) {
        return;
      }

      onHeadlineDimChange(false);
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);

    return () =>
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [isChaseActive, onHeadlineDimChange]);

  const handleDialogOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsDialogOpen(isOpen);

      if (!isOpen) {
        resetChase();
      }
    },
    [resetChase]
  );

  const advanceChase = useCallback(() => {
    const button = movingIdeaRef.current;

    if (!button) {
      return;
    }

    stopTrembling();

    const nextClickCount = chaseClicks + 1;

    if (nextClickCount >= CHASE_CLICKS_REQUIRED) {
      resetChase();
      setIsDialogOpen(true);
      return;
    }

    const buttonRect = button.getBoundingClientRect();

    setChaseClicks(nextClickCount);
    setChasePosition(
      getRandomChasePosition(
        buttonRect,
        button.offsetWidth,
        button.offsetHeight,
        chaseBarSettings.ideaScale
      )
    );
    scheduleIdeaReturn();
  }, [
    chaseBarSettings.ideaScale,
    chaseClicks,
    resetChase,
    scheduleIdeaReturn,
    stopTrembling
  ]);

  const handleAttributionClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) {
        resetChase();
        setIsDialogOpen(true);
        return;
      }

      const idea = ideaOriginRef.current;

      if (!idea) {
        return;
      }

      const ideaRect = idea.getBoundingClientRect();

      hideCallout();
      didStealInCurrentChaseRef.current = false;
      setChaseOrigin({ x: ideaRect.left, y: ideaRect.top });
      setChasePosition(
        getRandomChasePosition(
          ideaRect,
          idea.offsetWidth,
          idea.offsetHeight,
          chaseBarSettings.ideaScale
        )
      );
      onHeadlineDimChange(true);
      setIsChaseActive(true);
      scheduleIdeaReturn();
    },
    [
      chaseBarSettings.ideaScale,
      hideCallout,
      onHeadlineDimChange,
      resetChase,
      scheduleIdeaReturn
    ]
  );

  const handleMovingIdeaClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) {
        resetChase();
        setIsDialogOpen(true);
        return;
      }

      didStealInCurrentChaseRef.current = true;
      setIdeasStolen((currentCount) => currentCount + 1);
      advanceChase();
    },
    [advanceChase, resetChase]
  );

  const handleTrembleStart = useCallback(() => {
    if (trembleStartedAtRef.current !== null || isReturning) {
      return;
    }

    clearInactivityTimers();
    onHeadlineDimChange(true);
    trembleStartedAtRef.current = performance.now();
    trembleTimeoutRef.current = setTimeout(() => {
      trembleTimeoutRef.current = null;
      advanceChase();
    }, chaseBarSettings.trembleDuration);
  }, [
    advanceChase,
    chaseBarSettings.trembleDuration,
    clearInactivityTimers,
    isReturning,
    onHeadlineDimChange
  ]);

  const handleTrembleStop = useCallback(() => {
    stopTrembling();
    scheduleIdeaReturn();
  }, [scheduleIdeaReturn, stopTrembling]);

  const handleAttributionPointerEnter = useCallback(() => {
    if (ideasStolen === 0) {
      return;
    }

    hideCallout();
    setCalloutMode('stolen');
  }, [hideCallout, ideasStolen]);

  const handleAttributionPointerLeave = useCallback(() => {
    if (calloutMode === 'stolen') {
      setCalloutMode(null);
    }
  }, [calloutMode]);

  const attributionButton = (
    <button
      data-v2-content-cursor='true'
      data-v2-hide-cursor='true'
      type='button'
      className={`${fontClassName} v2-social-attribution text-[10px] leading-none font-extralight text-zinc-500 hover:text-zinc-300 focus-visible:rounded-sm focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300 sm:text-xs ${
        !isSettled ? 'opacity-100' : 'opacity-20'
      }`}
      style={hoverStyle}
      onClick={handleAttributionClick}
      onPointerEnter={handleAttributionPointerEnter}
      onPointerLeave={handleAttributionPointerLeave}
    >
      steal my <span ref={ideaOriginRef}>idea</span>, not my creativity
    </button>
  );

  const attributionPlaceholder = (
    <span
      aria-hidden='true'
      className={`${fontClassName} v2-social-attribution text-[10px] leading-none font-extralight text-zinc-500 opacity-20 sm:text-xs`}
    >
      steal my <span className='invisible'>idea</span>, not my creativity
    </span>
  );

  const movingIdeaButton =
    chasePosition && chaseOrigin ? (
      <motion.button
        ref={movingIdeaRef}
        data-v2-content-cursor='true'
        data-v2-hide-cursor='true'
        type='button'
        animate={{
          scale: isReturning ? 1 : chaseBarSettings.ideaScale,
          x: chasePosition.x,
          y: chasePosition.y
        }}
        className={`${fontClassName} v2-social-attribution-chasing fixed top-0 left-0 z-[13000] text-[10px] leading-none font-medium text-zinc-300 focus-visible:rounded-sm focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300 sm:text-xs ${
          isReturning ? 'pointer-events-none' : ''
        }`}
        initial={{ scale: 1, x: chaseOrigin.x, y: chaseOrigin.y }}
        transition={{
          duration: shouldReduceMotion
            ? 0
            : (isReturning
                ? chaseBarSettings.ideaReturnDuration
                : chaseBarSettings.ideaMoveDuration) / 1000,
          ease: [0.16, 1, 0.3, 1]
        }}
        onClick={handleMovingIdeaClick}
        onPointerEnter={handleTrembleStart}
        onPointerLeave={handleTrembleStop}
      >
        <motion.span
          className='inline-block'
          style={{ x: trembleX }}
        >
          idea
        </motion.span>
      </motion.button>
    ) : null;

  const chaseLayer =
    isChaseActive && typeof document !== 'undefined'
      ? createPortal(
          <>
            <motion.div
              role='status'
              aria-label='keep chasing creativity'
              aria-live='polite'
              className='fixed left-1/2 z-[13500] flex -translate-x-1/2 items-center'
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: -chaseBarSettings.entranceDistance
                    }
              }
              animate={{ opacity: 1, y: 0 }}
              style={{
                columnGap: chaseBarSettings.gap,
                padding: `${chaseBarSettings.verticalPadding}px ${chaseBarSettings.horizontalPadding}px`,
                top: chaseBarSettings.topOffset,
                width: `min(${chaseBarSettings.width}px, calc(100vw - 2rem))`
              }}
              transition={{
                duration: shouldReduceMotion
                  ? 0
                  : chaseBarSettings.transitionDuration / 1000,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <span className='shrink-0 text-[10px] leading-none font-medium tracking-[0.12em] text-zinc-300'>
                keep chasing creativity
              </span>
              <span
                className='flex-1 overflow-hidden bg-white/15'
                style={{ height: chaseBarSettings.trackHeight }}
              >
                <span
                  className='block h-full bg-zinc-100 transition-[width] ease-out motion-reduce:transition-none'
                  style={{
                    transitionDuration: `${chaseBarSettings.transitionDuration}ms`,
                    width: `${(chaseClicks / CHASE_CLICKS_REQUIRED) * 100}%`
                  }}
                />
              </span>
            </motion.div>
            {movingIdeaButton}
          </>,
          document.body
        )
      : null;

  const chaseBarDevPanel =
    IS_V2_CHASE_BAR_DEV_PANEL_ENABLED && isClientMounted
      ? createPortal(
          <V2ChaseBarDevPanel
            settings={chaseBarSettings}
            onChange={handleChaseBarSettingChange}
            onReset={handleChaseBarReset}
          />,
          document.body
        )
      : null;

  return (
    <Dialog.Root
      open={isDialogOpen}
      onOpenChange={handleDialogOpenChange}
    >
      <div className='relative'>
        {calloutMode ? (
          <motion.div
            role='status'
            className={`${fontClassName} pointer-events-none absolute right-0 bottom-[calc(100%+0.5rem)] z-[13000] rounded-md border border-white/10 bg-zinc-950/95 px-2.5 py-2 text-[10px] leading-none font-normal whitespace-nowrap text-zinc-300 shadow-xl`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          >
            {calloutMode === 'mock'
              ? 'hehe, could nott steal me'
              : `ideas stolen: ${ideasStolen}`}
          </motion.div>
        ) : null}
        {isChaseActive ? attributionPlaceholder : attributionButton}
      </div>
      {chaseLayer}
      {chaseBarDevPanel}

      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-[14000] bg-black/70' />

        <Dialog.Content
          data-v2-content-cursor='true'
          className='fixed top-1/2 left-1/2 z-[14010] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-zinc-100 shadow-2xl sm:p-7'
        >
          <Dialog.Title className='pr-10 text-xl leading-tight font-medium'>
            A small request
          </Dialog.Title>

          <Dialog.Description className='mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base'>
            Feel free to use this site as inspiration for your own ideas. If you
            use my work, please attribute Sudesh Das and link back to this site.
          </Dialog.Description>

          <Dialog.Close asChild>
            <button
              type='button'
              aria-label='Close'
              className='absolute top-5 right-5 rounded-md p-1 text-zinc-500 hover:text-zinc-100 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300'
            >
              <Cross2Icon className='size-4' />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
