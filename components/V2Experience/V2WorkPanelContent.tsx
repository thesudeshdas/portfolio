'use client';

import Lenis from 'lenis';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IProject } from '@/types/project/project.types';

interface IBentoLayoutItem {
  height: number;
  slug: string;
  width: number;
  x: number;
  y: number;
}

interface IBentoLayoutLabel {
  text: string;
  x: number;
  y: number;
}

interface IBentoLayout {
  height: number;
  id: string;
  items: IBentoLayoutItem[];
  label: string;
  labels?: IBentoLayoutLabel[];
  width: number;
}

interface IBentoProject {
  layout: IBentoLayoutItem;
  project: IProject;
}

interface IBentoCategory extends Omit<IBentoLayout, 'items'> {
  projects: IBentoProject[];
}

const MOBILE_PROJECT_SLUGS = new Set(['dryve', 'growthx-mobile-app']);
const BENTO_GAP = 5;
const CATEGORY_EDGE_THRESHOLD = 72;
const CARD_HOVER_REENABLE_DELAY_MS = 300;
const SCROLL_EDGE_TOLERANCE = 2;
const LENIS_EASING = (progress: number) =>
  Math.min(1, 1.001 - 2 ** (-10 * progress));

const BENTO_LAYOUTS: IBentoLayout[] = [
  {
    id: 'building',
    label: 'currently building',
    width: 319,
    height: 219,
    items: [
      { slug: 'stayhireable', x: 0, y: 0, width: 191, height: 107 },
      { slug: 'take-a-break', x: 0, y: 112, width: 191, height: 107 },
      {
        slug: 'dryve',
        x: 191 + BENTO_GAP,
        y: 0,
        width: 123,
        height: 219
      }
    ]
  },
  {
    id: 'growthx',
    label: 'growthx',
    width: 857,
    height: 222,
    labels: [{ text: 'growthx', x: 324, y: 91 }],
    items: [
      { slug: 'growthx-mobile-app', x: 0, y: 0, width: 123, height: 219 },
      {
        slug: 'growthx-community-member-connect',
        x: 128,
        y: 0,
        width: 237,
        height: 78
      },
      {
        slug: 'growthx-event-chat',
        x: 128,
        y: 78 + BENTO_GAP,
        width: 117,
        height: 138
      },
      {
        slug: 'growthx-chrome-extension',
        x: 250,
        y: 78 + BENTO_GAP,
        width: 67,
        height: 67
      },
      {
        slug: 'growthx-notifications-platform',
        x: 250,
        y: 78 + BENTO_GAP + 67 + BENTO_GAP,
        width: 67,
        height: 67
      },
      {
        slug: 'growthx-community-platform',
        x: 322,
        y: 111 + BENTO_GAP,
        width: 186,
        height: 104
      },
      {
        slug: 'growthx-elevate',
        x: 370,
        y: 0,
        width: 197,
        height: 111
      },
      {
        slug: 'growthx-resume-review',
        x: 513,
        y: 111 + BENTO_GAP,
        width: 54,
        height: 104
      },
      {
        slug: 'growthx-ai-roadmap',
        x: 572,
        y: 0,
        width: 87,
        height: 219
      },
      {
        slug: 'growthx-admin-ops-tooling',
        x: 664,
        y: 0,
        width: 193,
        height: 108
      },
      {
        slug: 'growthx-talent-platform',
        x: 664,
        y: 108 + BENTO_GAP,
        width: 193,
        height: 108
      }
    ]
  },
  {
    id: 'talentplace-neog',
    label: 'talentplace.ai + neog',
    width: 481,
    height: 220,
    labels: [
      { text: 'talentplace.ai', x: 179, y: 2 },
      { text: 'neog', x: 381, y: 203 }
    ],
    items: [
      {
        slug: 'talentplace-pdf-generation',
        x: 0,
        y: 0,
        width: 123,
        height: 219
      },
      {
        slug: 'talentplace-career-profile-builder',
        x: 128,
        y: 21,
        width: 174,
        height: 97
      },
      {
        slug: 'job-portal',
        x: 128,
        y: 21 + 97 + BENTO_GAP,
        width: 174,
        height: 97
      },
      { slug: 'neog-camp', x: 307, y: 0, width: 174, height: 97 },
      {
        slug: 'neog-admissions',
        x: 307,
        y: 97 + BENTO_GAP,
        width: 174,
        height: 97
      }
    ]
  },
  {
    id: 'archive',
    label: 'graveyard',
    width: 471,
    height: 219,
    labels: [{ text: 'graveyard', x: 0, y: 0 }],
    items: [
      { slug: 'catalyst', x: 0, y: 17, width: 114, height: 64 },
      {
        slug: 'tic-tac-toe',
        x: 114 + BENTO_GAP,
        y: 17,
        width: 114,
        height: 64
      },
      {
        slug: 'fun-with-flags',
        x: (114 + BENTO_GAP) * 2,
        y: 17,
        width: 114,
        height: 64
      },
      {
        slug: 'how-well-do-you-know-me',
        x: (114 + BENTO_GAP) * 3,
        y: 17,
        width: 114,
        height: 64
      },
      {
        slug: 'etch-a-sketch',
        x: 0,
        y: 17 + 64 + BENTO_GAP,
        width: 114,
        height: 64
      },
      {
        slug: 'rock-paper-scissors',
        x: 114 + BENTO_GAP,
        y: 17 + 64 + BENTO_GAP,
        width: 114,
        height: 64
      },
      {
        slug: 'speak-shakespeare',
        x: (114 + BENTO_GAP) * 2,
        y: 17 + 64 + BENTO_GAP,
        width: 114,
        height: 64
      },
      {
        slug: 'covid-19-quiz',
        x: (114 + BENTO_GAP) * 3,
        y: 17 + 64 + BENTO_GAP,
        width: 114,
        height: 64
      },
      {
        slug: 'dashtra',
        x: 0,
        y: 17 + (64 + BENTO_GAP) * 2,
        width: 114,
        height: 64
      },
      {
        slug: 'skill-recommendation-app',
        x: 114 + BENTO_GAP,
        y: 17 + (64 + BENTO_GAP) * 2,
        width: 114,
        height: 64
      },
      {
        slug: 'speak-banana',
        x: (114 + BENTO_GAP) * 2,
        y: 17 + (64 + BENTO_GAP) * 2,
        width: 114,
        height: 64
      },
      {
        slug: 'library',
        x: (114 + BENTO_GAP) * 3,
        y: 17 + (64 + BENTO_GAP) * 2,
        width: 114,
        height: 64
      }
    ]
  }
];

function buildBentoCategories(projects: IProject[]): IBentoCategory[] {
  const projectsBySlug = new Map(
    projects.map((project) => [project.slug, project])
  );

  return BENTO_LAYOUTS.map(({ items, ...layout }) => ({
    ...layout,
    projects: items.flatMap((item) => {
      const project = projectsBySlug.get(item.slug);

      return project ? [{ layout: item, project }] : [];
    })
  })).filter((category) => category.projects.length > 0);
}

function BentoProjectShell({
  children,
  className,
  onPointerEnter,
  onPointerLeave,
  project,
  style
}: {
  children: React.ReactNode;
  className: string;
  onPointerEnter?: React.PointerEventHandler<HTMLElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLElement>;
  project: IProject;
  style: React.CSSProperties;
}) {
  return (
    <article
      aria-label={
        project.slug === 'dryve' ? 'Dryve, coming soon' : project.title
      }
      data-v2-content-cursor='true'
      data-v2-hide-cursor='true'
      className={className}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={style}
    >
      {children}
    </article>
  );
}

function BentoProjectCard({
  canvasHeight,
  canvasWidth,
  isHoverEnabled,
  layout,
  project
}: {
  canvasHeight: number;
  canvasWidth: number;
  isHoverEnabled: boolean;
  layout: IBentoLayoutItem;
  project: IProject;
}) {
  const isMobileProject = MOBILE_PROJECT_SLUGS.has(project.slug);
  const isFeatureCard = layout.width * layout.height >= 20000;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPointerOverRef = useRef(false);

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, []);

  const playVideo = useCallback(() => {
    const video = videoRef.current;

    if (
      !video ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    video.currentTime = 0;
    void video.play().catch(() => undefined);
  }, []);

  const handlePointerEnter = useCallback(() => {
    isPointerOverRef.current = true;

    if (isHoverEnabled) {
      playVideo();
    }
  }, [isHoverEnabled, playVideo]);

  const handlePointerLeave = useCallback(() => {
    isPointerOverRef.current = false;
    pauseVideo();
  }, [pauseVideo]);

  useEffect(() => {
    if (!isHoverEnabled) {
      pauseVideo();
      return;
    }

    if (isPointerOverRef.current) {
      playVideo();
    }
  }, [isHoverEnabled, pauseVideo, playVideo]);

  return (
    <BentoProjectShell
      className='group absolute isolate overflow-hidden bg-[#151516] p-3 focus-visible:z-10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-zinc-200 sm:p-4'
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      project={project}
      style={{
        height: `${(layout.height / canvasHeight) * 100}%`,
        left: `${(layout.x / canvasWidth) * 100}%`,
        top: `${(layout.y / canvasHeight) * 100}%`,
        width: `${(layout.width / canvasWidth) * 100}%`
      }}
    >
      {project.cover ? (
        <>
          <Image
            fill
            alt=''
            className={`-z-20 object-cover opacity-20 grayscale ${
              isHoverEnabled
                ? 'transition duration-700 group-hover:scale-[1.025] group-hover:opacity-100 group-hover:grayscale-0'
                : ''
            }`}
            quality={90}
            sizes={`${Math.ceil((layout.width / canvasHeight) * 100)}vh`}
            src={project.cover}
          />
          {project.video ? (
            <video
              ref={videoRef}
              aria-hidden='true'
              className={`absolute inset-0 -z-20 size-full object-cover opacity-0 ${
                isHoverEnabled
                  ? 'transition-opacity duration-300 group-hover:opacity-100'
                  : ''
              }`}
              loop
              muted
              playsInline
              poster={project.cover}
              preload='metadata'
              src={project.video}
            />
          ) : null}
          <span
            className={`absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/70 to-black/20 ${
              isHoverEnabled
                ? 'transition-opacity duration-300 group-hover:opacity-0'
                : ''
            }`}
          />
        </>
      ) : (
        <span className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.065),transparent_32%)]' />
      )}

      <span
        className={`flex h-full flex-col justify-between ${
          project.cover && isHoverEnabled
            ? 'transition-opacity duration-300 group-hover:opacity-0'
            : ''
        }`}
      >
        <span className='text-[8px] tracking-[0.13em] text-zinc-600 uppercase'>
          <span>{project.organisation ?? project.year}</span>
        </span>

        <span>
          <span
            className={`block leading-[0.98] font-extralight tracking-[-0.045em] text-zinc-200 ${
              isFeatureCard
                ? 'text-xl sm:text-2xl lg:text-3xl'
                : 'text-sm sm:text-base lg:text-lg'
            }`}
          >
            {project.title}
          </span>
          {isFeatureCard && isMobileProject ? (
            <span className='mt-4 hidden max-w-xl text-xs leading-relaxed text-zinc-500 sm:block'>
              {project.description}
            </span>
          ) : null}
          <span className='mt-3 flex items-center justify-between gap-2 text-[9px] text-zinc-600'>
            <span className='truncate'>
              {project.slug === 'dryve'
                ? 'Mobile app · coming soon'
                : project.highlight ?? project.role}
            </span>
          </span>
        </span>
      </span>
    </BentoProjectShell>
  );
}

function BentoTrack({
  category,
  isHoverEnabled,
  trackRef
}: {
  category: IBentoCategory;
  isHoverEnabled: boolean;
  trackRef: (element: HTMLDivElement | null) => void;
}) {
  return (
    <div className='relative h-full'>
      <div
        ref={trackRef}
        aria-label={`${category.label} horizontal projects`}
        className='h-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        role='region'
        tabIndex={0}
      >
        <div className='inline-flex h-full w-max max-w-none px-5 sm:px-8 lg:px-16'>
          <div
            className='relative h-full w-auto shrink-0'
            style={{ aspectRatio: `${category.width} / ${category.height}` }}
          >
            {category.labels?.map((label) => (
              <span
                key={`${category.id}-${label.text}`}
                className='pointer-events-none absolute z-10 text-[10px] leading-none text-zinc-300'
                style={{
                  left: `${(label.x / category.width) * 100}%`,
                  top: `${(label.y / category.height) * 100}%`
                }}
              >
                {label.text}
              </span>
            ))}
            {category.projects.map(({ layout, project }) => (
              <BentoProjectCard
                key={project.slug}
                canvasHeight={category.height}
                canvasWidth={category.width}
                isHoverEnabled={isHoverEnabled}
                layout={layout}
                project={project}
              />
            ))}
          </div>
        </div>
      </div>

      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#111112] via-[#111112]/85 to-transparent'
      />
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[#111112] via-[#111112]/85 to-transparent'
      />
    </div>
  );
}

export default function V2WorkPanelContent({
  onCategoryChange,
  projects
}: {
  onCategoryChange: (category: {
    direction: number;
    id: string;
    label: string;
  }) => void;
  projects: IProject[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);
  const verticalLenisRef = useRef<Lenis | null>(null);
  const activeCategoryIndexRef = useRef(0);
  const boundaryDirectionRef = useRef(0);
  const boundaryDistanceRef = useRef(0);
  const boundaryNeedsFreshGestureRef = useRef(false);
  const lastBoundaryEventTimeRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const hoverReenableTimeoutRef = useRef<number | null>(null);
  const [isCardHoverEnabled, setIsCardHoverEnabled] = useState(true);
  const categories = useMemo(() => buildBentoCategories(projects), [projects]);

  const markScrollActivity = useCallback(() => {
    setIsCardHoverEnabled(false);

    if (hoverReenableTimeoutRef.current !== null) {
      window.clearTimeout(hoverReenableTimeoutRef.current);
    }

    hoverReenableTimeoutRef.current = window.setTimeout(() => {
      setIsCardHoverEnabled(true);
      hoverReenableTimeoutRef.current = null;
    }, CARD_HOVER_REENABLE_DELAY_MS);
  }, []);

  const moveToCategory = useCallback(
    (direction: -1 | 1) => {
      if (isTransitioningRef.current) {
        return;
      }

      const nextIndex = activeCategoryIndexRef.current + direction;
      const nextCategory = categories[nextIndex];
      const nextSection = sectionRefs.current[nextIndex];
      const verticalLenis = verticalLenisRef.current;

      if (!nextCategory || !nextSection || !verticalLenis) {
        return;
      }

      isTransitioningRef.current = true;
      activeCategoryIndexRef.current = nextIndex;
      boundaryDirectionRef.current = 0;
      boundaryDistanceRef.current = 0;
      boundaryNeedsFreshGestureRef.current = false;
      onCategoryChange({
        direction,
        id: nextCategory.id,
        label: nextCategory.label
      });

      const completeTransition = () => {
        isTransitioningRef.current = false;
      };
      const shouldReduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      verticalLenis.scrollTo(nextSection, {
        duration: shouldReduceMotion ? undefined : 0.9,
        easing: LENIS_EASING,
        force: true,
        immediate: shouldReduceMotion,
        lock: true,
        onComplete: completeTransition
      });

      if (shouldReduceMotion) {
        completeTransition();
      }
    },
    [categories, onCategoryChange]
  );

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;

    if (!root || !content || categories.length === 0) {
      return;
    }

    const verticalLenis = new Lenis({
      autoRaf: false,
      content,
      gestureOrientation: 'vertical',
      lerp: 0.075,
      orientation: 'vertical',
      overscroll: false,
      smoothWheel: false,
      wrapper: root
    });

    const horizontalLenis = categories.map((_, index) => {
      const track = trackRefs.current[index];
      const trackContent = track?.firstElementChild;

      if (!track || !(trackContent instanceof HTMLElement)) {
        return null;
      }

      const lenis = new Lenis({
        autoRaf: false,
        content: trackContent,
        gestureOrientation: 'both',
        lerp: 0.075,
        orientation: 'horizontal',
        overscroll: false,
        smoothWheel: true,
        virtualScroll: ({ event }) => {
          if (
            index === activeCategoryIndexRef.current &&
            !isTransitioningRef.current
          ) {
            return true;
          }

          if (event.cancelable) {
            event.preventDefault();
          }

          return false;
        },
        wheelMultiplier: 0.9,
        wrapper: track
      });

      lenis.on('virtual-scroll', ({ deltaX, deltaY }) => {
        if (
          index !== activeCategoryIndexRef.current ||
          isTransitioningRef.current
        ) {
          return;
        }

        const horizontalDelta =
          Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

        if (horizontalDelta === 0) {
          return;
        }

        markScrollActivity();

        const direction = horizontalDelta > 0 ? 1 : -1;
        const canScrollForward =
          direction === 1 &&
          lenis.targetScroll < lenis.limit - SCROLL_EDGE_TOLERANCE;
        const canScrollBackward =
          direction === -1 && lenis.targetScroll > SCROLL_EDGE_TOLERANCE;

        if (canScrollForward || canScrollBackward) {
          boundaryDirectionRef.current = direction;
          boundaryDistanceRef.current = 0;
          boundaryNeedsFreshGestureRef.current = true;
          lastBoundaryEventTimeRef.current = performance.now();
          return;
        }

        const now = performance.now();
        const continuesHorizontalGesture =
          boundaryNeedsFreshGestureRef.current &&
          boundaryDirectionRef.current === direction &&
          now - lastBoundaryEventTimeRef.current <= 240;

        if (continuesHorizontalGesture) {
          lastBoundaryEventTimeRef.current = now;
          return;
        }

        boundaryNeedsFreshGestureRef.current = false;
        const startsNewBoundaryIntent =
          boundaryDirectionRef.current !== direction ||
          now - lastBoundaryEventTimeRef.current > 240;

        boundaryDirectionRef.current = direction;
        boundaryDistanceRef.current = startsNewBoundaryIntent
          ? Math.abs(horizontalDelta)
          : boundaryDistanceRef.current + Math.abs(horizontalDelta);
        lastBoundaryEventTimeRef.current = now;

        if (boundaryDistanceRef.current >= CATEGORY_EDGE_THRESHOLD) {
          moveToCategory(direction);
        }
      });
      lenis.on('scroll', markScrollActivity);

      return lenis;
    });

    verticalLenisRef.current = verticalLenis;
    activeCategoryIndexRef.current = 0;
    boundaryDirectionRef.current = 0;
    boundaryDistanceRef.current = 0;
    boundaryNeedsFreshGestureRef.current = false;
    verticalLenis.scrollTo(0, { force: true, immediate: true });
    onCategoryChange({
      direction: 1,
      id: categories[0].id,
      label: categories[0].label
    });
    verticalLenis.on('scroll', markScrollActivity);

    let animationFrame = 0;
    const updateScroll = (time: number) => {
      verticalLenis.raf(time);
      horizontalLenis.forEach((lenis) => lenis?.raf(time));
      animationFrame = window.requestAnimationFrame(updateScroll);
    };

    animationFrame = window.requestAnimationFrame(updateScroll);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      horizontalLenis.forEach((lenis) => {
        lenis?.off('scroll', markScrollActivity);
        lenis?.destroy();
      });
      verticalLenis.off('scroll', markScrollActivity);
      verticalLenis.destroy();
      verticalLenisRef.current = null;
      isTransitioningRef.current = false;

      if (hoverReenableTimeoutRef.current !== null) {
        window.clearTimeout(hoverReenableTimeoutRef.current);
        hoverReenableTimeoutRef.current = null;
      }
    };
  }, [categories, markScrollActivity, moveToCategory, onCategoryChange]);

  return (
    <div
      ref={rootRef}
      aria-label='Scrollable work projects'
      className='relative h-full overflow-hidden overscroll-contain'
      role='region'
      tabIndex={0}
    >
      <div
        ref={contentRef}
        className='h-full'
      >
        {categories.map((category, index) => (
          <section
            key={category.id}
            ref={(section) => {
              sectionRefs.current[index] = section;
            }}
            aria-label={`${category.label} projects`}
            className='h-full min-h-full pt-1 pb-8 sm:pt-3'
            data-category-index={index}
          >
            <BentoTrack
              category={category}
              isHoverEnabled={isCardHoverEnabled}
              trackRef={(track) => {
                trackRefs.current[index] = track;
              }}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
