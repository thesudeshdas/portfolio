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

import type { IV2Writing } from '@/types/writing/writing.types';

interface IV2WritingsPanelContentProps {
  initialWritingSlug?: string;
  onActiveWritingTitleChange: (title: string | null) => void;
  onWritingSlugChange: (slug: string | undefined) => void;
  writings: IV2Writing[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric'
  });
}

function WritingMeta({ writing }: { writing: IV2Writing }) {
  return (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500'>
      <time dateTime={writing.date}>{formatDate(writing.date)}</time>
      <span>{writing.readingMinutes} min read</span>
    </div>
  );
}

function ReadMore({
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
    <section className='mt-16 border-t border-zinc-800 pt-10'>
      <h2 className='mb-7 text-2xl font-light tracking-[-0.03em] text-zinc-100'>
        more by yours truly
      </h2>

      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {writings.map((writing) => (
          <button
            key={writing.slug}
            aria-label={`Read ${writing.title}`}
            className='group text-left transition-transform duration-300 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300 active:scale-[0.98]'
            onClick={() => onSelect(writing)}
            type='button'
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

            <span className='mt-4 block text-xl !leading-[1.2] font-light tracking-[-0.025em] text-zinc-200 transition-colors group-hover:text-white'>
              {writing.title}
            </span>
            <time
              className='mt-2 block text-sm text-zinc-500'
              dateTime={writing.date}
            >
              {formatDate(writing.date)}
            </time>
          </button>
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
    <article className='v2-writing-article mx-auto w-full max-w-[800px] pb-20'>
      <header className='mb-12 sm:mb-16'>
        <WritingMeta writing={writing} />
        <h3
          ref={titleRef}
          className='mt-5 text-5xl !leading-[0.98] font-extralight tracking-[-0.055em] text-balance text-zinc-100 sm:text-7xl'
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

        <div className='mt-3 text-sm text-zinc-500'>
          <ReactMarkdown
            components={{
              a: ({ children, href }) => (
                <a
                  className='underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-zinc-200'
                  href={href}
                  rel='noopener noreferrer'
                  target='_blank'
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
          blockquote: ({ children }) => (
            <blockquote className='my-10 border-l border-zinc-500 pl-6 text-xl leading-8 font-light text-zinc-300 sm:text-2xl sm:leading-9'>
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className='font-mono text-sm text-zinc-200'>{children}</code>
          ),
          h2: ({ children }) => (
            <h2 className='mt-14 mb-5 text-2xl font-light tracking-[-0.03em] text-zinc-100 sm:text-3xl'>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className='mt-10 mb-4 text-xl font-light text-zinc-100'>
              {children}
            </h3>
          ),
          hr: () => <hr className='my-10 border-zinc-800' />,
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
            <li className='pl-1 text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8'>
              {children}
            </li>
          ),
          ol: ({ children }) => (
            <ol className='my-7 list-decimal space-y-2 pl-5'>{children}</ol>
          ),
          p: ({ children }) => (
            <p className='mb-5 text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8'>
              {children}
            </p>
          ),
          pre: ({ children }) => (
            <pre className='my-8 overflow-x-auto rounded-sm bg-zinc-950 p-5 text-sm leading-6 text-zinc-200'>
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

      <ReadMore
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

  useEffect(() => {
    const nextSlug = writings.some(
      (writing) => writing.slug === initialWritingSlug
    )
      ? initialWritingSlug ?? null
      : null;

    setSelectedSlug(nextSlug);
    onActiveWritingTitleChange(null);
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [initialWritingSlug, onActiveWritingTitleChange, writings]);

  if (writings.length === 0) {
    return (
      <div className='grid h-full place-items-center px-6 text-center text-sm text-zinc-500'>
        Add a Markdown file to assets/writings to begin.
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className='h-full overflow-y-auto px-5 py-6 sm:px-8 lg:px-16 lg:py-8'
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
              className='mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-100 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-400 active:scale-[0.98]'
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
                  className='v2-writing-index-item group grid w-full gap-4 border-t border-zinc-800 py-7 text-left transition-opacity duration-300 focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-zinc-400 active:scale-[0.995] sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-center sm:py-9'
                  onClick={() => handleSelect(writing)}
                  type='button'
                >
                  <span className='max-w-3xl text-2xl leading-tight font-extralight tracking-[-0.035em] text-zinc-300 transition-transform duration-300 group-hover:translate-x-2 group-hover:text-white sm:text-4xl'>
                    {writing.title}
                  </span>
                  <span className='text-sm text-zinc-600'>
                    {formatDate(writing.date)}
                  </span>
                  <ArrowRightIcon className='text-zinc-600 transition-colors group-hover:text-zinc-100' />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
