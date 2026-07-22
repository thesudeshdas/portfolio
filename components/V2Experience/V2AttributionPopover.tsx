'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { motion, useReducedMotion } from 'motion/react';
import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';

const CHASE_CLICKS_REQUIRED = 3;
const CHASE_EDGE_PADDING_PX = 24;
const CHASE_TOP_CLEARANCE_PX = 96;
const CHASE_MIN_DISTANCE_PX = 160;
const CHASE_SCALE = 1.5;

interface ChasePosition {
  x: number;
  y: number;
}

interface V2AttributionPopoverProps {
  fontClassName: string;
  hoverStyle: CSSProperties;
  isSettled: boolean;
}

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * Math.max(maximum - minimum, 0);
}

function getRandomChasePosition(
  buttonRect: DOMRect,
  buttonWidth: number,
  buttonHeight: number
): ChasePosition {
  const scaledWidth = buttonWidth * CHASE_SCALE;
  const scaledHeight = buttonHeight * CHASE_SCALE;
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
  isSettled
}: V2AttributionPopoverProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [chaseClicks, setChaseClicks] = useState(0);
  const [chaseOrigin, setChaseOrigin] = useState<ChasePosition | null>(null);
  const [chasePosition, setChasePosition] = useState<ChasePosition | null>(
    null
  );
  const [isChaseActive, setIsChaseActive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const remainingClicks = CHASE_CLICKS_REQUIRED - chaseClicks;

  const resetChase = useCallback(() => {
    setChaseClicks(0);
    setChaseOrigin(null);
    setChasePosition(null);
    setIsChaseActive(false);
  }, []);

  const handleDialogOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsDialogOpen(isOpen);

      if (!isOpen) {
        resetChase();
      }
    },
    [resetChase]
  );

  const handleAttributionClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) {
        resetChase();
        setIsDialogOpen(true);
        return;
      }

      const button = buttonRef.current;

      if (!button) {
        return;
      }

      const buttonRect = button.getBoundingClientRect();
      const nextPosition = () =>
        getRandomChasePosition(
          buttonRect,
          button.offsetWidth,
          button.offsetHeight
        );

      if (!isChaseActive) {
        setChaseOrigin({ x: buttonRect.left, y: buttonRect.top });
        setChasePosition(nextPosition());
        setIsChaseActive(true);
        return;
      }

      const nextClickCount = chaseClicks + 1;

      if (nextClickCount >= CHASE_CLICKS_REQUIRED) {
        resetChase();
        setIsDialogOpen(true);
        return;
      }

      setChaseClicks(nextClickCount);
      setChasePosition(nextPosition());
    },
    [chaseClicks, isChaseActive, resetChase]
  );

  const attributionButton = (
    <motion.button
      ref={buttonRef}
      data-v2-content-cursor='true'
      data-v2-hide-cursor='true'
      type='button'
      animate={
        isChaseActive && chasePosition
          ? {
              scale: CHASE_SCALE,
              x: chasePosition.x,
              y: chasePosition.y
            }
          : undefined
      }
      className={`${fontClassName} v2-social-attribution text-[10px] leading-none font-extralight text-zinc-500 hover:text-zinc-300 focus-visible:rounded-sm focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300 sm:text-xs ${
        isChaseActive || !isSettled ? 'opacity-100' : 'opacity-20'
      } ${
        isChaseActive
          ? 'v2-social-attribution-chasing fixed top-0 left-0 z-[13000]'
          : ''
      }`}
      initial={
        isChaseActive && chaseOrigin
          ? { scale: 1, x: chaseOrigin.x, y: chaseOrigin.y }
          : false
      }
      style={hoverStyle}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: [0.16, 1, 0.3, 1]
      }}
      onClick={handleAttributionClick}
    >
      steal my idea, not my creativity
    </motion.button>
  );

  const chaseLayer =
    isChaseActive && typeof document !== 'undefined'
      ? createPortal(
          <>
            <motion.div
              role='status'
              aria-live='polite'
              className='fixed top-5 left-1/2 z-[13500] flex w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-md border border-white/15 bg-zinc-950/90 px-3 py-2 shadow-2xl backdrop-blur-md'
              initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className='shrink-0 text-[10px] leading-none font-medium tracking-[0.12em] text-zinc-300 uppercase'>
                {remainingClicks} {remainingClicks === 1 ? 'click' : 'clicks'}{' '}
                left
              </span>
              <span className='h-px flex-1 overflow-hidden bg-white/15'>
                <span
                  className='block h-full bg-zinc-100 transition-[width] duration-300 ease-out motion-reduce:transition-none'
                  style={{
                    width: `${(chaseClicks / CHASE_CLICKS_REQUIRED) * 100}%`
                  }}
                />
              </span>
            </motion.div>
            {attributionButton}
          </>,
          document.body
        )
      : null;

  return (
    <Dialog.Root
      open={isDialogOpen}
      onOpenChange={handleDialogOpenChange}
    >
      {isChaseActive ? chaseLayer : attributionButton}

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
