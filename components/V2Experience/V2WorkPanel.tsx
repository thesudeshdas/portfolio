'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type CSSProperties, useEffect, useRef } from 'react';

import type {
  V2WorkPanelDirection,
  V2WorkPanelSettings
} from './v2-work-panel.settings';

interface IV2WorkPanelProps {
  fontClassName: string;
  isOpen: boolean;
  onClose: () => void;
  settings: V2WorkPanelSettings;
  workHoverStyle: CSSProperties;
}

const directionAngles: Record<V2WorkPanelDirection, number> = {
  top: -90,
  'top-right': -45,
  right: 0,
  'bottom-right': 45,
  bottom: 90,
  'bottom-left': 135,
  left: 180,
  'top-left': -135
};

function getPanelOffset(direction: V2WorkPanelDirection, angleOffset: number) {
  const angle = ((directionAngles[direction] + angleOffset) * Math.PI) / 180;
  const travel = Math.SQRT2 * 100;

  return {
    x: `${Math.cos(angle) * travel}%`,
    y: `${Math.sin(angle) * travel}%`
  };
}

export default function V2WorkPanel({
  fontClassName,
  isOpen,
  onClose,
  settings,
  workHoverStyle
}: IV2WorkPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  const entryTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: settings.entryDuration / 1000,
        ease: [
          settings.entryBezierX1,
          settings.entryBezierY1,
          settings.entryBezierX2,
          settings.entryBezierY2
        ] as [number, number, number, number]
      };

  const exitTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: settings.exitDuration / 1000,
        ease: [
          settings.exitBezierX1,
          settings.exitBezierY1,
          settings.exitBezierX2,
          settings.exitBezierY2
        ] as [number, number, number, number]
      };

  const entryOffset = getPanelOffset(
    settings.entryDirection,
    settings.entryAngle
  );
  const exitOffset = getPanelOffset(settings.exitDirection, settings.exitAngle);

  const panelVariants = {
    entry: entryOffset,
    exit: {
      ...exitOffset,
      transition: exitTransition
    },
    open: {
      x: 0,
      y: 0,
      transition: entryTransition
    }
  };

  const backdropVariants = {
    entry: {
      opacity: 0
    },
    exit: {
      opacity: 0,
      transition: exitTransition
    },
    open: {
      opacity: 0.7,
      transition: entryTransition
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key='v2-work-panel-layer'
          animate='open'
          className='contents'
          exit='exit'
          initial='entry'
        >
          <motion.button
            aria-label='Close work panel'
            className='fixed inset-0 z-[12000] bg-black backdrop-blur-[2px]'
            onClick={onClose}
            type='button'
            variants={backdropVariants}
          />

          <motion.section
            aria-labelledby='v2-work-panel-title'
            aria-modal='true'
            className={`${fontClassName} fixed top-0 right-0 z-[12001] flex flex-col overflow-hidden bg-[#111112] text-zinc-100 shadow-[0_30px_100px_rgba(0,0,0,0.68)]`}
            role='dialog'
            style={{
              height: `${settings.height}dvh`,
              width: `${settings.width}vw`
            }}
            variants={panelVariants}
          >
            <header className='flex h-[110px] shrink-0 items-center px-5 sm:px-8 lg:px-16'>
              <h2
                id='v2-work-panel-title'
                className='v2-work-panel-title text-[24px] font-extralight'
                style={workHoverStyle}
              >
                work
              </h2>

              <motion.button
                ref={closeButtonRef}
                aria-label='Close work panel'
                data-v2-content-cursor='true'
                data-v2-hide-cursor='true'
                className='absolute top-[17px] right-[21.859375px] grid size-10 place-items-center text-zinc-100 opacity-55 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 sm:top-[29px] sm:right-[33.859375px] lg:top-[35px] lg:right-[39.859375px]'
                onClick={onClose}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.15,
                  ease: [0.16, 1, 0.3, 1]
                }}
                type='button'
                whileHover={{
                  opacity: 1,
                  scale: shouldReduceMotion ? 1 : 1.25
                }}
              >
                <Cross2Icon
                  aria-hidden='true'
                  className='size-5'
                />
              </motion.button>
            </header>

            <div className='min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-8 sm:px-8 sm:pt-6 lg:px-16'>
              <div className='grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-10 lg:gap-16'>
                <motion.a
                  className='group relative flex aspect-[3/2] items-center justify-center rounded-xl border border-zinc-600 bg-[#121213] px-6 text-center transition-colors hover:border-zinc-300 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300'
                  href='/projects/stayhireable'
                  whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                >
                  <span className='text-3xl leading-none font-light tracking-[-0.04em] text-zinc-300 transition-colors group-hover:text-zinc-50 sm:text-4xl'>
                    stayhireable
                  </span>
                </motion.a>

                <article className='relative flex aspect-[3/2] items-center justify-center rounded-xl border border-zinc-600 bg-[#121213] px-6 text-center'>
                  <span className='absolute top-4 right-4 text-[10px] leading-none text-zinc-500'>
                    coming soon
                  </span>
                  <span className='text-3xl leading-none font-light tracking-[-0.04em] text-zinc-300 sm:text-4xl'>
                    dryve
                  </span>
                </article>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
