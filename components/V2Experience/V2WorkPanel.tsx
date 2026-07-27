'use client';

import { Cross2Icon } from '@radix-ui/react-icons';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import type { IProject } from '@/types/project/project.types';

import V2WorkPanelContent from './V2WorkPanelContent';
import type {
  V2WorkPanelDirection,
  V2WorkPanelSettings
} from './v2-work-panel.settings';

interface IV2WorkPanelProps {
  fontClassName: string;
  isOpen: boolean;
  onClose: () => void;
  projects: IProject[];
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

export default function V2WorkPanel({
  fontClassName,
  isOpen,
  onClose,
  projects,
  settings,
  workHoverStyle
}: IV2WorkPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [workCategory, setWorkCategory] = useState({
    direction: 1,
    id: 'building',
    label: 'currently building'
  });
  const handleWorkCategoryChange = useCallback(
    (category: { direction: number; id: string; label: string }) => {
      setWorkCategory(category);
    },
    []
  );

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
            ref={panelRef}
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
              <div className='flex items-baseline gap-5'>
                <h2
                  id='v2-work-panel-title'
                  className='v2-work-panel-title text-[24px] font-extralight opacity-35'
                  style={workHoverStyle}
                >
                  work
                </h2>

                <div className='h-6 overflow-hidden'>
                  <AnimatePresence
                    initial={false}
                    mode='wait'
                  >
                    <motion.span
                      key={workCategory.id}
                      animate={{ y: 0 }}
                      aria-live='polite'
                      className='block text-base font-light text-zinc-100'
                      exit={{
                        y: workCategory.direction > 0 ? -12 : 12
                      }}
                      initial={{
                        y: workCategory.direction > 0 ? 12 : -12
                      }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.28,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                    >
                      {workCategory.label}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              <motion.button
                ref={closeButtonRef}
                aria-label='Close work panel'
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

            <div className='relative min-h-0 flex-1 overflow-hidden'>
              <V2WorkPanelContent
                onCategoryChange={handleWorkCategoryChange}
                projects={projects}
              />
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
