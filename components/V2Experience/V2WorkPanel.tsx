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

import V2WorkPanelContent, {
  V2_WORK_PANEL_ACCENTS,
  type V2WorkPanelViewMode
} from './V2WorkPanelContent';
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

interface ICollapseCardSnapshot {
  height: number;
  left: number;
  title: string;
  top: number;
  width: number;
}

interface ICollapseTarget {
  x: number;
  y: number;
}

const CARD_COLLAPSE_DURATION_SECONDS = 0.52;
const CARD_COLLAPSE_SCALE = 0.04;
const CARD_COLLAPSE_STAGGER_SECONDS = 0.07;

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
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [collapseCards, setCollapseCards] = useState<ICollapseCardSnapshot[]>(
    []
  );
  const [collapseTarget, setCollapseTarget] = useState<ICollapseTarget | null>(
    null
  );
  const [viewMode, setViewMode] = useState<V2WorkPanelViewMode>('projects');
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
  const handleCategoryClick = useCallback(() => {
    const panel = panelRef.current;
    const categoryButton = categoryButtonRef.current;

    if (!panel || !categoryButton || viewMode !== 'projects') {
      return;
    }

    const panelRect = panel.getBoundingClientRect();
    const categoryRect = categoryButton.getBoundingClientRect();
    const activeSection = Array.from(
      panel.querySelectorAll<HTMLElement>('[data-category-id]')
    ).find((section) => section.dataset.categoryId === workCategory.id);
    const cards = Array.from(
      activeSection?.querySelectorAll<HTMLElement>(
        '[data-v2-project-card="true"]'
      ) ?? []
    )
      .map((card) => {
        const rect = card.getBoundingClientRect();

        return {
          height: rect.height,
          left: rect.left - panelRect.left,
          title: card.dataset.projectTitle ?? '',
          top: rect.top - panelRect.top,
          width: rect.width
        };
      })
      .filter(
        (card) =>
          card.left + card.width > 0 &&
          card.left < panelRect.width &&
          card.top + card.height > 0 &&
          card.top < panelRect.height
      );

    if (cards.length === 0) {
      return;
    }

    setCollapseTarget({
      x: categoryRect.left - panelRect.left + categoryRect.width / 2,
      y: categoryRect.top - panelRect.top + categoryRect.height / 2
    });
    setCollapseCards(cards);
    setViewMode('collapsing');
  }, [viewMode, workCategory.id]);
  const handleCardCollapseComplete = useCallback(() => {
    setCollapseCards([]);
    setViewMode('categories');
  }, []);
  const handleCategoryGridSelect = useCallback(() => {
    setCollapseTarget(null);
    setViewMode('projects');
  }, []);

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

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setCollapseCards([]);
    setCollapseTarget(null);
    setViewMode('projects');
  }, [isOpen]);

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
              <div className='flex items-baseline gap-8'>
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
                    {viewMode !== 'categories' ? (
                      <motion.button
                        key={workCategory.id}
                        ref={categoryButtonRef}
                        animate={{ opacity: 1, y: 0 }}
                        aria-label='Show all work categories'
                        aria-live='polite'
                        className='block text-left text-base font-light text-zinc-100 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300 disabled:pointer-events-none'
                        data-v2-content-cursor='true'
                        disabled={viewMode === 'collapsing'}
                        exit={{
                          opacity: 0,
                          y: workCategory.direction > 0 ? -12 : 12
                        }}
                        initial={{
                          opacity: 0,
                          y: workCategory.direction > 0 ? 12 : -12
                        }}
                        onClick={handleCategoryClick}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.28,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        type='button'
                      >
                        {workCategory.label}
                      </motion.button>
                    ) : null}
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
                onCategoryGridSelect={handleCategoryGridSelect}
                projects={projects}
                viewMode={viewMode}
              />
            </div>

            {viewMode === 'collapsing' && collapseTarget ? (
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 z-30 overflow-hidden'
              >
                {collapseCards.map((card, index) => (
                  <motion.div
                    key={`${card.title}-${index}`}
                    animate={{
                      opacity: [1, 1, 0],
                      scale: CARD_COLLAPSE_SCALE,
                      x: collapseTarget.x - (card.left + card.width / 2),
                      y: collapseTarget.y - (card.top + card.height / 2)
                    }}
                    className='absolute isolate overflow-hidden bg-[#151516] p-3 text-zinc-200 sm:p-4'
                    initial={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      y: 0
                    }}
                    onAnimationComplete={
                      index === collapseCards.length - 1
                        ? handleCardCollapseComplete
                        : undefined
                    }
                    style={{
                      backgroundImage: `radial-gradient(circle at 80% 20%, ${
                        V2_WORK_PANEL_ACCENTS[
                          index % V2_WORK_PANEL_ACCENTS.length
                        ]
                      }, transparent 58%)`,
                      height: card.height,
                      left: card.left,
                      top: card.top,
                      transformOrigin: 'center',
                      width: card.width
                    }}
                    transition={{
                      delay: shouldReduceMotion
                        ? 0
                        : index * CARD_COLLAPSE_STAGGER_SECONDS,
                      duration: shouldReduceMotion
                        ? 0
                        : CARD_COLLAPSE_DURATION_SECONDS,
                      ease: [0.16, 1, 0.3, 1],
                      times: [0, 0.72, 1]
                    }}
                  >
                    <span className='flex h-full items-end text-sm font-extralight sm:text-base'>
                      {card.title}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
