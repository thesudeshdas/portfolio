'use client';

import { ArrowTopRightIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import type { IProject, ProjectCategory } from '@/types/project/project.types';

const CATEGORY_ORDER: ProjectCategory[] = [
  'building',
  'open-source',
  'product',
  'work',
  'personal',
  'graveyard'
];

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  building: 'Currently building',
  'open-source': 'Open source',
  product: 'Products',
  work: 'Work',
  personal: 'Personal',
  graveyard: 'Archive'
};

function getProjectMeta(project: IProject) {
  if (project.slug === 'dryve') {
    return 'Mobile app · coming soon';
  }

  return (
    [project.organisation, project.year].filter(Boolean).join(' · ') ||
    CATEGORY_LABELS[project.category]
  );
}

function ScrollProjectLink({
  children,
  className,
  project
}: {
  children: React.ReactNode;
  className: string;
  project: IProject;
}) {
  if (project.slug === 'dryve') {
    return (
      <article
        aria-label='Dryve, coming soon'
        className={className}
      >
        {children}
      </article>
    );
  }

  return (
    <Link
      className={className}
      href={`/projects/${project.slug}`}
    >
      {children}
    </Link>
  );
}

export function ScrollingProjectStack({ projects }: { projects: IProject[] }) {
  return (
    <div className='mx-auto max-w-6xl'>
      <header className='mb-10 grid gap-8 border-b border-zinc-800 pb-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end'>
        <div>
          <p className='mb-4 text-[10px] tracking-[0.2em] text-zinc-600 uppercase'>
            Mock 04 · Continuous stack
          </p>
          <h3 className='max-w-3xl text-4xl leading-[0.96] font-extralight tracking-[-0.05em] text-zinc-100 sm:text-6xl'>
            One project follows another.
          </h3>
        </div>
        <p className='max-w-xs text-sm leading-relaxed text-zinc-500'>
          A direct, uninterrupted read through every project. Scroll to move
          through the complete body of work.
        </p>
      </header>

      <div className='divide-y divide-zinc-800'>
        {projects.map((project, index) => (
          <ScrollProjectLink
            key={project.slug}
            className='group grid min-h-[52dvh] gap-8 py-10 [content-visibility:auto] sm:grid-cols-[72px_minmax(0,1fr)] lg:min-h-[60dvh] lg:grid-cols-[90px_minmax(0,1.1fr)_minmax(260px,0.65fr)] lg:items-center'
            project={project}
          >
            <div className='flex items-center justify-between self-start text-[10px] tracking-[0.14em] text-zinc-600 uppercase sm:block'>
              <span>
                {(index + 1).toString().padStart(2, '0')} /{' '}
                {projects.length.toString().padStart(2, '0')}
              </span>
              <span className='sm:mt-3 sm:block'>{project.year}</span>
            </div>

            <div>
              <p className='mb-4 text-[10px] tracking-[0.14em] text-zinc-500 uppercase'>
                {project.organisation ?? CATEGORY_LABELS[project.category]}
              </p>
              <h4 className='max-w-4xl text-4xl leading-[0.94] font-extralight tracking-[-0.055em] text-zinc-200 transition-transform duration-300 group-hover:translate-x-2 sm:text-6xl lg:text-7xl'>
                {project.title}
              </h4>
              <p className='mt-7 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base'>
                {project.description}
              </p>
            </div>

            <div className='flex h-full flex-col justify-between border-l border-zinc-800 pl-5 sm:col-start-2 lg:col-start-auto lg:pl-8'>
              <p className='max-w-sm text-sm leading-relaxed text-zinc-400'>
                {project.highlight ?? project.role}
              </p>
              <span className='mt-10 inline-flex items-center gap-2 text-xs text-zinc-500 transition-colors group-hover:text-zinc-100'>
                {project.slug === 'dryve'
                  ? 'Case study coming soon'
                  : 'Open case study'}
                {project.slug === 'dryve' ? null : <ArrowTopRightIcon />}
              </span>
            </div>
          </ScrollProjectLink>
        ))}
      </div>

      <footer className='flex min-h-[34dvh] items-center justify-between border-t border-zinc-800 text-zinc-500'>
        <span className='text-[10px] tracking-[0.2em] uppercase'>
          End of index
        </span>
        <span className='text-3xl font-extralight tracking-[-0.04em] text-zinc-300'>
          {projects.length} projects
        </span>
      </footer>
    </div>
  );
}

export function StickyProjectTimeline({ projects }: { projects: IProject[] }) {
  const groups = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        projects: projects.filter((project) => project.category === category)
      })).filter((group) => group.projects.length > 0),
    [projects]
  );

  const scrollToCategory = (category: ProjectCategory) => {
    document
      .getElementById(`v2-scroll-timeline-${category}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  let projectNumber = 0;

  return (
    <div className='grid min-w-0 gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14'>
      <aside className='min-w-0 lg:sticky lg:top-0 lg:h-fit'>
        <p className='mb-4 text-[10px] tracking-[0.2em] text-zinc-600 uppercase'>
          Mock 05 · Timeline
        </p>
        <h3 className='max-w-sm text-4xl leading-[0.96] font-extralight tracking-[-0.05em] text-zinc-100'>
          The work, by chapter.
        </h3>
        <p className='mt-5 max-w-xs text-sm leading-relaxed text-zinc-500'>
          The directory stays fixed while the complete project history moves
          beside it.
        </p>

        <nav
          aria-label='Scroll to project category'
          className='mt-8 flex gap-1 overflow-x-auto border-t border-zinc-800 pt-4 lg:flex-col lg:overflow-visible'
        >
          {groups.map(({ category, projects: categoryProjects }, index) => (
            <button
              key={category}
              className='group flex shrink-0 items-center justify-between gap-5 px-2 py-2 text-left text-xs text-zinc-600 transition-colors hover:text-zinc-100 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 lg:w-full lg:px-0'
              onClick={() => scrollToCategory(category)}
              type='button'
            >
              <span>
                <span className='mr-3 text-[9px] text-zinc-700'>
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                {CATEGORY_LABELS[category]}
              </span>
              <span className='text-[9px] text-zinc-700'>
                {categoryProjects.length}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <div className='min-w-0'>
        {groups.map(({ category, projects: categoryProjects }) => (
          <section
            key={category}
            id={`v2-scroll-timeline-${category}`}
            className='scroll-mt-0 border-t border-zinc-700 pb-20'
          >
            <header className='sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-[#111112]/95 py-4 backdrop-blur'>
              <h4 className='text-sm font-light text-zinc-300'>
                {CATEGORY_LABELS[category]}
              </h4>
              <span className='text-[10px] tracking-[0.15em] text-zinc-600 uppercase'>
                {categoryProjects.length} projects
              </span>
            </header>

            <div className='divide-y divide-zinc-800'>
              {categoryProjects.map((project) => {
                projectNumber += 1;

                return (
                  <ScrollProjectLink
                    key={project.slug}
                    className='group grid min-h-[320px] gap-8 py-10 [content-visibility:auto] sm:grid-cols-[52px_minmax(0,1fr)] xl:grid-cols-[52px_minmax(0,1fr)_280px] xl:items-center'
                    project={project}
                  >
                    <span className='self-start text-[10px] text-zinc-700'>
                      {projectNumber.toString().padStart(2, '0')}
                    </span>
                    <div>
                      <p className='mb-4 text-[10px] tracking-[0.14em] text-zinc-600 uppercase'>
                        {getProjectMeta(project)}
                      </p>
                      <h5 className='max-w-3xl text-4xl leading-none font-extralight tracking-[-0.05em] text-zinc-200 transition-colors group-hover:text-white sm:text-5xl'>
                        {project.title}
                      </h5>
                      <p className='mt-6 max-w-2xl text-sm leading-relaxed text-zinc-500'>
                        {project.description}
                      </p>
                    </div>
                    <div className='border-l border-zinc-800 pl-6 sm:col-start-2 xl:col-start-auto'>
                      <p className='text-sm leading-relaxed text-zinc-400'>
                        {project.highlight ?? project.role}
                      </p>
                      <span className='mt-8 inline-flex items-center gap-2 text-xs text-zinc-600 transition-colors group-hover:text-zinc-200'>
                        {project.slug === 'dryve' ? 'Coming soon' : 'Read more'}
                        {project.slug === 'dryve' ? null : (
                          <ArrowTopRightIcon />
                        )}
                      </span>
                    </div>
                  </ScrollProjectLink>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function ProjectScrollStories({ projects }: { projects: IProject[] }) {
  return (
    <div>
      {projects.map((project, index) => (
        <ScrollProjectLink
          key={project.slug}
          className='group relative isolate grid min-h-[calc(95dvh-4rem)] snap-start overflow-hidden border-b border-zinc-800 px-5 py-8 [content-visibility:auto] sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.42fr)] lg:px-16'
          project={project}
        >
          {project.cover ? (
            <>
              <Image
                fill
                alt=''
                className='-z-20 object-cover opacity-20 grayscale transition duration-700 group-hover:scale-[1.02] group-hover:opacity-30 group-hover:grayscale-0'
                sizes='95vw'
                src={project.cover}
              />
              <span className='absolute inset-0 -z-10 bg-gradient-to-r from-[#111112] via-[#111112]/90 to-[#111112]/45' />
            </>
          ) : (
            <span className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_22%,rgba(255,255,255,0.07),transparent_30%)]' />
          )}

          <div className='flex flex-col justify-between'>
            <div className='flex items-center gap-5 text-[10px] tracking-[0.16em] text-zinc-500 uppercase'>
              <span>
                {(index + 1).toString().padStart(2, '0')} /{' '}
                {projects.length.toString().padStart(2, '0')}
              </span>
              <span className='h-px w-10 bg-zinc-700' />
              <span>{CATEGORY_LABELS[project.category]}</span>
            </div>

            <div className='my-12'>
              <p className='mb-5 text-sm text-zinc-500'>
                {project.organisation ?? 'Independent'} · {project.year}
              </p>
              <h3 className='max-w-5xl text-5xl leading-[0.88] font-extralight tracking-[-0.065em] text-zinc-100 sm:text-7xl lg:text-[clamp(4.5rem,8vw,9rem)]'>
                {project.title}
              </h3>
            </div>

            <span className='inline-flex items-center gap-2 text-xs text-zinc-500 transition-colors group-hover:text-white'>
              {project.slug === 'dryve'
                ? 'Case study coming soon'
                : 'Open project'}
              {project.slug === 'dryve' ? null : <ArrowTopRightIcon />}
            </span>
          </div>

          <aside className='flex flex-col justify-end border-t border-zinc-800 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10'>
            <p className='text-base leading-relaxed text-zinc-300'>
              {project.description}
            </p>
            {project.highlight ? (
              <p className='mt-8 text-sm leading-relaxed text-zinc-500'>
                {project.highlight}
              </p>
            ) : null}
            <div className='mt-10 h-px bg-zinc-800'>
              <span
                className='block h-px bg-zinc-300'
                style={{
                  width: `${((index + 1) / projects.length) * 100}%`
                }}
              />
            </div>
          </aside>
        </ScrollProjectLink>
      ))}

      <footer className='flex min-h-[calc(95dvh-4rem)] snap-start flex-col items-center justify-center px-6 text-center'>
        <p className='text-[10px] tracking-[0.22em] text-zinc-600 uppercase'>
          All projects viewed
        </p>
        <p className='mt-6 text-5xl font-extralight tracking-[-0.055em] text-zinc-200 sm:text-7xl'>
          End of the reel.
        </p>
      </footer>
    </div>
  );
}
