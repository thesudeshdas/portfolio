'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ReactMarkdown from 'react-markdown';

import { getScrollDepthPercentage, trackEvent } from '@/lib/analytics';
import type { IV2Writing } from '@/types/writing/writing.types';

import V2WritingShare from './V2WritingShare';

interface IV2WritingsPanelContentProps {
  initialWritingSlug?: string;
  onActiveWritingTitleChange: (title: string | null) => void;
  onWritingSlugChange: (slug: string | undefined) => void;
  writings: IV2Writing[];
}

const writingDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric'
});
const SCROLL_CHECKPOINTS = [25, 50, 75, 100] as const;
const OPEN_IN_NEW_TAB_PROPS = {
  referrerPolicy: 'strict-origin-when-cross-origin' as const,
  target: '_blank'
};

function getOrdinalSuffix(day: number) {
  const lastTwoDigits = day % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function formatDate(date: string) {
  const parts = writingDateFormatter.formatToParts(new Date(date));
  const day = parts.find((part) => part.type === 'day')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const year = parts.find((part) => part.type === 'year')?.value;

  return `${day}${getOrdinalSuffix(Number(day))} ${month}, ${year}`;
}

function WritingMeta({ writing }: { writing: IV2Writing }) {
  return (
    <div className='flex items-center justify-between gap-4 text-sm text-[var(--v2-text-muted)]'>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
        <time dateTime={writing.date}>{formatDate(writing.date)}</time>
        <span>{writing.readingMinutes} min read</span>
      </div>

      <V2WritingShare
        slug={writing.slug}
        title={writing.title}
      />
    </div>
  );
}

function RelatedWritings({
  onSelect,
  writings
}: {
  onSelect: (writing: IV2Writing) => void;
  writings: IV2Writing[];
}) {
  if (writings.length === 0) {
    return null;
  }

  return (
    <section
      className='mt-16 border-t border-[var(--v2-border)] pt-10'
      data-analytics-section='related'
    >
      <h2 className='mb-7 text-2xl font-light tracking-[-0.03em] text-[var(--v2-text-strong)]'>
        related
      </h2>

      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {writings.map((writing) => (
          <a
            key={writing.slug}
            aria-label={`Read ${writing.title}`}
            className='group text-left transition-transform duration-300 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--v2-focus)] active:scale-[0.98]'
            data-analytics-link-label={writing.title}
            data-analytics-link-location='related'
            href={`/writings/${writing.slug}`}
            onClick={(event) => {
              event.preventDefault();
              onSelect(writing);
            }}
          >
            <span className='relative block aspect-video w-full overflow-hidden'>
              <Image
                fill
                alt={`Cover for ${writing.title}`}
                className='object-cover grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0'
                sizes='(max-width: 640px) 100vw, 33vw'
                src={writing.image}
              />
            </span>

            <span className='mt-4 block text-xl !leading-[1.2] font-light tracking-[-0.025em] text-[var(--v2-text)] transition-colors group-hover:text-[var(--v2-text-strong)]'>
              {writing.title}
            </span>
            <time
              className='mt-2 block text-sm text-[var(--v2-text-muted)]'
              dateTime={writing.date}
            >
              {formatDate(writing.date)}
            </time>
          </a>
        ))}
      </div>
    </section>
  );
}

function MarkdownArticle({
  onHeaderTitleChange,
  onSelect,
  scrollRootRef,
  writing,
  writings
}: {
  onHeaderTitleChange: (title: string | null) => void;
  onSelect: (writing: IV2Writing) => void;
  scrollRootRef: RefObject<HTMLDivElement | null>;
  writing: IV2Writing;
  writings: IV2Writing[];
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const scrollRoot = scrollRootRef.current;

    if (!title || !scrollRoot) {
      return;
    }

    onHeaderTitleChange(null);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const hasScrolledPastTitle =
          !entry.isIntersecting &&
          entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0);

        onHeaderTitleChange(hasScrolledPastTitle ? writing.title : null);
      },
      {
        root: scrollRoot,
        threshold: 0
      }
    );

    observer.observe(title);

    return () => {
      observer.disconnect();
      onHeaderTitleChange(null);
    };
  }, [onHeaderTitleChange, scrollRootRef, writing.title]);

  return (
    <article
      className='v2-writing-article mx-auto w-full max-w-[800px] pb-20'
      data-analytics-section='writing'
    >
      <header className='mb-12 sm:mb-16'>
        <WritingMeta writing={writing} />
        <h3
          ref={titleRef}
          className='mt-5 text-5xl !leading-[0.98] font-extralight tracking-[-0.055em] text-balance text-[var(--v2-text-strong)] sm:text-7xl'
        >
          {writing.title}
        </h3>

        <div className='relative mt-8 aspect-video w-full overflow-hidden'>
          <Image
            fill
            alt={writing.imageAlt}
            className='object-cover'
            priority
            sizes='(max-width: 900px) 100vw, 800px'
            src={writing.image}
          />
        </div>

        <div className='mt-3 text-sm text-[var(--v2-text-muted)]'>
          <ReactMarkdown
            components={{
              a: ({ children, href }) => (
                <a
                  className='underline decoration-[var(--v2-border)] underline-offset-4 transition-colors hover:text-[var(--v2-text-strong)]'
                  href={href}
                  rel='noopener external'
                  {...OPEN_IN_NEW_TAB_PROPS}
                  data-analytics-link-location='attribution'
                >
                  {children}
                </a>
              ),
              p: ({ children }) => <span>{children}</span>
            }}
          >
            {writing.attribution}
          </ReactMarkdown>
        </div>
      </header>

      <ReactMarkdown
        components={{
          a: ({ children, href }) => (
            <a
              className='underline decoration-[var(--v2-border)] underline-offset-4 transition-colors hover:text-[var(--v2-text-strong)]'
              data-analytics-link-location='writing'
              href={href}
              rel='noopener external'
              {...OPEN_IN_NEW_TAB_PROPS}
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className='my-10 border-l border-[var(--v2-text-muted)] pl-6 text-xl leading-8 font-light text-[var(--v2-text)] sm:text-2xl sm:leading-9'>
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className='font-mono text-sm text-[var(--v2-text)]'>
              {children}
            </code>
          ),
          h2: ({ children }) => (
            <h2 className='mt-14 mb-5 text-2xl font-light tracking-[-0.03em] text-[var(--v2-text-strong)] sm:text-3xl'>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className='mt-10 mb-4 text-xl font-light text-[var(--v2-text-strong)]'>
              {children}
            </h3>
          ),
          hr: () => <hr className='my-10 border-[var(--v2-border)]' />,
          img: ({ alt, src }) =>
            src ? (
              <span className='relative my-10 block aspect-video w-full overflow-hidden rounded-sm'>
                <Image
                  fill
                  unoptimized
                  alt={alt ?? ''}
                  className='object-cover grayscale'
                  sizes='(max-width: 900px) 100vw, 800px'
                  src={src}
                />
              </span>
            ) : null,
          li: ({ children }) => (
            <li className='pl-1 text-sm leading-7 text-[var(--v2-text)] sm:text-base sm:leading-8'>
              {children}
            </li>
          ),
          ol: ({ children }) => (
            <ol className='my-7 list-decimal space-y-2 pl-5'>{children}</ol>
          ),
          p: ({ children }) => (
            <p className='mb-5 text-sm leading-7 text-[var(--v2-text)] sm:text-base sm:leading-8'>
              {children}
            </p>
          ),
          pre: ({ children }) => (
            <pre className='my-8 overflow-x-auto rounded-sm bg-[var(--v2-surface-elevated)] p-5 text-sm leading-6 text-[var(--v2-text)]'>
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className='my-7 list-disc space-y-2 pl-5'>{children}</ul>
          )
        }}
      >
        {writing.markdown}
      </ReactMarkdown>

      {writing.links.length > 0 ? (
        <section
          className='mt-16 border-t border-[var(--v2-border)] pt-10'
          data-analytics-section='links'
        >
          <div className='mb-7 flex items-center justify-between gap-4'>
            <h2 className='text-2xl font-light tracking-[-0.03em] text-[var(--v2-text-strong)]'>
              links
            </h2>

            <V2WritingShare
              slug={writing.slug}
              title={writing.title}
            />
          </div>

          <ul className='flex flex-wrap gap-x-6 gap-y-3'>
            {writing.links.map((link) => (
              <li key={link.url}>
                <a
                  className='text-sm text-[var(--v2-text)] underline decoration-[var(--v2-border)] underline-offset-4 transition-colors hover:text-[var(--v2-text-strong)] sm:text-base'
                  data-analytics-link-label={link.label}
                  data-analytics-link-location='links'
                  href={link.url}
                  rel='noopener external'
                  {...OPEN_IN_NEW_TAB_PROPS}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <RelatedWritings
        onSelect={onSelect}
        writings={writings}
      />
    </article>
  );
}

export default function V2WritingsPanelContent({
  initialWritingSlug,
  onActiveWritingTitleChange,
  onWritingSlugChange,
  writings
}: IV2WritingsPanelContentProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() =>
    writings.some((writing) => writing.slug === initialWritingSlug)
      ? initialWritingSlug ?? null
      : null
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const trackedScrollCheckpointsRef = useRef(new Set<number>());
  const shouldReduceMotion = useReducedMotion();
  const activeWriting = useMemo(
    () => writings.find((writing) => writing.slug === selectedSlug) ?? null,
    [selectedSlug, writings]
  );
  const handleSelect = useCallback(
    (writing: IV2Writing) => {
      setSelectedSlug(writing.slug);
      onActiveWritingTitleChange(null);
      onWritingSlugChange(writing.slug);

      if (window.location.pathname !== `/writings/${writing.slug}`) {
        window.history.pushState(null, '', `/writings/${writing.slug}`);
      }

      window.requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          top: 0
        });
      });
    },
    [onActiveWritingTitleChange, onWritingSlugChange, shouldReduceMotion]
  );
  const handleBack = useCallback(() => {
    setSelectedSlug(null);
    onActiveWritingTitleChange(null);
    onWritingSlugChange(undefined);

    if (window.location.pathname !== '/writings') {
      window.history.pushState(null, '', '/writings');
    }
  }, [onActiveWritingTitleChange, onWritingSlugChange]);
  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !activeWriting) return;

    const percentage = getScrollDepthPercentage(
      scrollContainer.scrollTop,
      scrollContainer.scrollHeight,
      scrollContainer.clientHeight
    );

    for (const checkpoint of SCROLL_CHECKPOINTS) {
      if (
        percentage < checkpoint ||
        trackedScrollCheckpointsRef.current.has(checkpoint)
      ) {
        continue;
      }

      trackedScrollCheckpointsRef.current.add(checkpoint);
      trackEvent('writings.page.scrolled', {
        scroll_depth_percentage: checkpoint,
        writing_slug: activeWriting.slug
      });
    }
  }, [activeWriting]);

  useEffect(() => {
    const nextSlug = writings.some(
      (writing) => writing.slug === initialWritingSlug
    )
      ? initialWritingSlug ?? null
      : null;

    setSelectedSlug(nextSlug);
    trackedScrollCheckpointsRef.current.clear();
    onActiveWritingTitleChange(null);
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [initialWritingSlug, onActiveWritingTitleChange, writings]);

  if (writings.length === 0) {
    return (
      <div className='grid h-full place-items-center px-6 text-center text-sm text-[var(--v2-text-muted)]'>
        Add a Markdown file to assets/writings to begin.
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className='h-full overflow-y-auto px-5 py-6 sm:px-8 lg:px-16 lg:py-8'
      data-analytics-section={activeWriting ? 'writing' : 'writings-index'}
      onScroll={handleScroll}
    >
      <AnimatePresence
        initial={false}
        mode='wait'
      >
        {activeWriting ? (
          <motion.div
            key={activeWriting.slug}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: 30 }}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 30 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <button
              className='mb-10 inline-flex items-center gap-2 text-sm text-[var(--v2-text-muted)] transition-colors hover:text-[var(--v2-text-strong)] focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--v2-focus)] active:scale-[0.98]'
              onClick={handleBack}
              type='button'
            >
              <ArrowLeftIcon aria-hidden='true' />
              All writings
            </button>

            <MarkdownArticle
              onHeaderTitleChange={onActiveWritingTitleChange}
              onSelect={handleSelect}
              scrollRootRef={scrollContainerRef}
              writing={activeWriting}
              writings={writings.filter(
                (writing) => writing.slug !== activeWriting.slug
              )}
            />
          </motion.div>
        ) : (
          <motion.div
            key='writings-index'
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: -30 }}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -30 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <div className='v2-writing-index'>
              {writings.map((writing) => (
                <button
                  key={writing.slug}
                  className='v2-writing-index-item group grid w-full gap-4 border-t border-[var(--v2-border)] py-7 text-left transition-opacity duration-300 focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-[var(--v2-focus)] active:scale-[0.995] sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-center sm:py-9'
                  onClick={() => handleSelect(writing)}
                  type='button'
                >
                  <span className='max-w-3xl text-2xl leading-tight font-extralight tracking-[-0.035em] text-[var(--v2-text)] transition-transform duration-300 group-hover:translate-x-2 group-hover:text-[var(--v2-text-strong)] sm:text-4xl'>
                    {writing.title}
                  </span>
                  <span className='text-sm text-[var(--v2-text-muted)]'>
                    {formatDate(writing.date)}
                  </span>
                  <ArrowRightIcon className='text-[var(--v2-text-muted)] transition-colors group-hover:text-[var(--v2-text-strong)]' />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
