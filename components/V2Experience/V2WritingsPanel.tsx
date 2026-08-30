'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

import type { IV2Writing } from '@/types/writing/writing.types';

import V2WritingsPanelContent from './V2WritingsPanelContent';
import type {
  V2WorkPanelDirection,
  V2WorkPanelSettings
} from './v2-work-panel.settings';

interface IV2WritingsPanelProps {
  fontClassName: string;
  initialWritingSlug?: string;
  isOpen: boolean;
  onClose: () => void;
  onWritingSlugChange: (slug: string | undefined) => void;
  settings: V2WorkPanelSettings;
  workHoverStyle: CSSProperties;
  writings: IV2Writing[];
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

const FOCUSABLE_ELEMENT_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function getPanelOffset(direction: V2WorkPanelDirection, angleOffset: number) {
  const angle = ((directionAngles[direction] + angleOffset) * Math.PI) / 180;
  const travel = Math.SQRT2 * 100;

  return {
    x: `${Math.cos(angle) * travel}%`,
    y: `${Math.sin(angle) * travel}%`
  };
}

export default function V2WritingsPanel({
  fontClassName,
  initialWritingSlug,
  isOpen,
  onClose,
  onWritingSlugChange,
  settings,
  workHoverStyle,
  writings
}: IV2WritingsPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [activeWritingTitle, setActiveWritingTitle] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isOpen) {
      setActiveWritingTitle(null);
    }
  }, [isOpen]);

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
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          FOCUSABLE_ELEMENT_SELECTOR
        )
      ).filter((element) => element.tabIndex >= 0);
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements.at(-1);

      if (!firstFocusableElement || !lastFocusableElement) {
        return;
      }

      if (
        event.shiftKey &&
        (document.activeElement === firstFocusableElement ||
          !panelRef.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        lastFocusableElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastFocusableElement
      ) {
        event.preventDefault();
        firstFocusableElement.focus();
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

  const panelVariants = {
    entry: getPanelOffset(settings.entryDirection, settings.entryAngle),
    exit: {
      ...getPanelOffset(settings.exitDirection, settings.exitAngle),
      transition: exitTransition
    },
    open: {
      x: 0,
      y: 0,
      transition: entryTransition
    }
  };

  const backdropVariants = {
    entry: { opacity: 0 },
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
          key='v2-writings-panel-layer'
          animate='open'
          className='contents'
          exit='exit'
          initial='entry'
        >
          <motion.button
            aria-label='Close writings panel'
            className='fixed inset-0 z-[12000] bg-black backdrop-blur-[2px]'
            onClick={onClose}
            type='button'
            variants={backdropVariants}
          />

          <motion.section
            ref={panelRef}
            aria-labelledby='v2-writings-panel-title'
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
              <div className='flex min-w-0 items-baseline gap-10'>
                <h2
                  id='v2-writings-panel-title'
                  className='v2-work-panel-title shrink-0 text-[24px] font-extralight opacity-35'
                  style={workHoverStyle}
                >
                  writings
                </h2>

                <div className='h-6 min-w-0 overflow-hidden'>
                  <AnimatePresence
                    initial={false}
                    mode='wait'
                  >
                    {activeWritingTitle ? (
                      <motion.span
                        key={activeWritingTitle}
                        animate={{ y: 0 }}
                        aria-live='polite'
                        className='block max-w-[52vw] truncate text-base font-light text-zinc-100'
                        exit={{ y: shouldReduceMotion ? 0 : -12 }}
                        initial={{ y: shouldReduceMotion ? 0 : 12 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.28,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                      >
                        {activeWritingTitle}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              <motion.button
                ref={closeButtonRef}
                aria-label='Close writings panel'
                data-v2-content-cursor='true'
                data-v2-hide-cursor='true'
                className='absolute top-[17px] right-[21.859375px] grid size-10 place-items-center text-zinc-100 opacity-55 focus-visible:opacity-100 focus-visible:outline-none sm:top-[29px] sm:right-[33.859375px] lg:top-[35px] lg:right-[39.859375px]'
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

            <div className='min-h-0 flex-1 overflow-hidden'>
              <V2WritingsPanelContent
                initialWritingSlug={initialWritingSlug}
                onActiveWritingTitleChange={setActiveWritingTitle}
                onWritingSlugChange={onWritingSlugChange}
                writings={writings}
              />
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
