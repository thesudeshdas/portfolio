'use client';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightIcon
} from '@radix-ui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IProject, ProjectCategory } from '@/types/project/project.types';

import {
  ProjectScrollStories,
  ScrollingProjectStack,
  StickyProjectTimeline
} from './V2WorkPanelScrollPrototypes';

// PROTOTYPE: Six work-panel layouts, switchable with ?workVariant=,
// on the existing /v2 route. Delete the losing variants after selection.

type WorkVariant =
  | 'index'
  | 'wall'
  | 'chapters'
  | 'stack'
  | 'timeline'
  | 'stories';

interface IV2WorkPanelPrototypeProps {
  projects: IProject[];
}

interface IWorkVariantDescriptor {
  id: WorkVariant;
  label: string;
}

interface IWorkChapter {
  id: string;
  label: string;
  projects: IProject[];
}

const WORK_VARIANTS: IWorkVariantDescriptor[] = [
  {
    id: 'index',
    label: 'Editorial index'
  },
  {
    id: 'wall',
    label: 'Poster wall'
  },
  {
    id: 'chapters',
    label: 'Company chapters'
  },
  {
    id: 'stack',
    label: 'Continuous stack'
  },
  {
    id: 'timeline',
    label: 'Sticky timeline'
  },
  {
    id: 'stories',
    label: 'Scroll stories'
  }
];

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

const CATEGORY_SHORT_LABELS: Record<ProjectCategory, string> = {
  building: 'Building',
  'open-source': 'Open source',
  product: 'Product',
  work: 'Work',
  personal: 'Personal',
  graveyard: 'Archive'
};

function isWorkVariant(value: string | undefined): value is WorkVariant {
  return WORK_VARIANTS.some((variant) => variant.id === value);
}

function groupProjectsByCategory(projects: IProject[]) {
  return CATEGORY_ORDER.reduce(
    (groups, category) => {
      const categoryProjects = projects.filter(
        (project) => project.category === category
      );

      if (categoryProjects.length > 0) {
        groups.push({
          category,
          projects: categoryProjects
        });
      }

      return groups;
    },
    [] as Array<{
      category: ProjectCategory;
      projects: IProject[];
    }>
  );
}

function buildChapters(projects: IProject[]): IWorkChapter[] {
  const independentProjects = projects.filter(
    (project) =>
      project.category === 'building' ||
      project.category === 'product' ||
      project.category === 'personal'
  );
  const workProjects = projects.filter(
    (project) => project.category === 'work'
  );
  const organisationNames = Array.from(
    new Set(
      workProjects
        .map((project) => project.organisation)
        .filter((organisation): organisation is string => Boolean(organisation))
    )
  );
  const workChapters = organisationNames.map((organisation) => ({
    id: organisation.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
    label: organisation,
    projects: workProjects.filter(
      (project) => project.organisation === organisation
    )
  }));
  const uncategorisedWork = workProjects.filter(
    (project) => !project.organisation
  );

  return [
    {
      id: 'now',
      label: 'Now building',
      projects: independentProjects
    },
    ...workChapters,
    {
      id: 'work',
      label: 'Other work',
      projects: uncategorisedWork
    },
    {
      id: 'open-source',
      label: 'Open source',
      projects: projects.filter((project) => project.category === 'open-source')
    },
    {
      id: 'archive',
      label: 'Archive',
      projects: projects.filter((project) => project.category === 'graveyard')
    }
  ].filter((chapter) => chapter.projects.length > 0);
}

function getProjectMeta(project: IProject) {
  if (project.slug === 'dryve') {
    return 'Mobile app · coming soon';
  }

  return [project.organisation, project.year].filter(Boolean).join(' · ');
}

function ProjectLink({
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

function EditorialIndex({ projects }: { projects: IProject[] }) {
  const groupedProjects = useMemo(
    () => groupProjectsByCategory(projects),
    [projects]
  );
  const [activeProjectSlug, setActiveProjectSlug] = useState(
    projects[0]?.slug ?? ''
  );
  const activeProject =
    projects.find((project) => project.slug === activeProjectSlug) ??
    projects[0];

  if (!activeProject) {
    return null;
  }

  return (
    <div className='grid min-h-full grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] xl:gap-16'>
      <div>
        <div className='mb-8 flex items-baseline justify-between border-b border-zinc-800 pb-3 text-[11px] tracking-[0.18em] text-zinc-500 uppercase'>
          <span>Selected work</span>
          <span>{projects.length.toString().padStart(2, '0')} projects</span>
        </div>

        <div className='space-y-10'>
          {groupedProjects.map(({ category, projects: categoryProjects }) => (
            <section key={category}>
              <div className='mb-2 flex items-center justify-between text-[11px] tracking-[0.14em] text-zinc-500 uppercase'>
                <h3>{CATEGORY_LABELS[category]}</h3>
                <span>{categoryProjects.length}</span>
              </div>

              <div className='border-t border-zinc-800'>
                {categoryProjects.map((project, index) => {
                  const isActive = project.slug === activeProject.slug;

                  return (
                    <div key={project.slug}>
                      <button
                        aria-pressed={isActive}
                        className='group grid w-full grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 border-b border-zinc-800 py-3 text-left focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 sm:grid-cols-[42px_minmax(0,1fr)_minmax(130px,auto)]'
                        onClick={() => setActiveProjectSlug(project.slug)}
                        onFocus={() => setActiveProjectSlug(project.slug)}
                        onPointerEnter={() =>
                          setActiveProjectSlug(project.slug)
                        }
                        type='button'
                      >
                        <span className='text-[10px] text-zinc-600'>
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                        <span
                          className={`truncate text-base leading-none font-light transition-[color,transform] duration-200 sm:text-lg ${
                            isActive
                              ? 'translate-x-1 text-zinc-100'
                              : 'text-zinc-400 group-hover:text-zinc-200'
                          }`}
                        >
                          {project.title}
                        </span>
                        <span className='hidden truncate text-right text-[11px] text-zinc-600 sm:block'>
                          {getProjectMeta(project)}
                        </span>
                      </button>

                      {isActive ? (
                        <div className='border-b border-zinc-800 py-5 pl-[42px] xl:hidden'>
                          <p className='max-w-xl text-sm leading-relaxed text-zinc-500'>
                            {project.description}
                          </p>
                          {project.slug === 'dryve' ? (
                            <span className='mt-4 block text-xs text-zinc-600'>
                              Case study coming soon
                            </span>
                          ) : (
                            <ProjectLink
                              className='mt-4 inline-flex items-center gap-2 text-xs text-zinc-300'
                              project={project}
                            >
                              View project
                              <ArrowTopRightIcon />
                            </ProjectLink>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <aside className='hidden xl:block'>
        <div className='sticky top-0 flex min-h-[520px] flex-col justify-between border-l border-zinc-800 pl-12'>
          <div>
            <div className='mb-12 flex items-center justify-between text-[11px] tracking-[0.15em] text-zinc-500 uppercase'>
              <span>{CATEGORY_SHORT_LABELS[activeProject.category]}</span>
              <span>{activeProject.year}</span>
            </div>
            <p className='mb-3 text-sm text-zinc-500'>
              {activeProject.organisation ?? 'Independent'}
            </p>
            <h3 className='max-w-[620px] text-5xl leading-[0.95] font-extralight tracking-[-0.055em] text-zinc-100'>
              {activeProject.title}
            </h3>
            <p className='mt-8 max-w-xl text-base leading-relaxed text-zinc-400'>
              {activeProject.description}
            </p>
            {activeProject.highlight ? (
              <p className='mt-8 max-w-lg border-l border-zinc-600 pl-4 text-sm leading-relaxed text-zinc-300'>
                {activeProject.highlight}
              </p>
            ) : null}
          </div>

          {activeProject.slug === 'dryve' ? (
            <span className='mt-12 text-sm text-zinc-600'>
              Case study coming soon
            </span>
          ) : (
            <ProjectLink
              className='group mt-12 inline-flex w-fit items-center gap-2 text-sm text-zinc-300 transition-colors hover:text-zinc-50 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300'
              project={activeProject}
            >
              View project
              <ArrowTopRightIcon className='transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
            </ProjectLink>
          )}
        </div>
      </aside>
    </div>
  );
}

function PosterWall({ projects }: { projects: IProject[] }) {
  const groupedProjects = useMemo(
    () => groupProjectsByCategory(projects),
    [projects]
  );
  let projectIndex = 0;

  return (
    <div className='space-y-16'>
      {groupedProjects.map(({ category, projects: categoryProjects }) => (
        <section key={category}>
          <header className='mb-5 flex items-end justify-between border-b border-zinc-800 pb-3'>
            <h3 className='text-xl font-light tracking-[-0.02em] text-zinc-200'>
              {CATEGORY_LABELS[category]}
            </h3>
            <span className='text-[11px] tracking-[0.16em] text-zinc-600 uppercase'>
              {categoryProjects.length.toString().padStart(2, '0')}
            </span>
          </header>

          <div className='grid auto-rows-[150px] grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[180px] lg:grid-cols-12'>
            {categoryProjects.map((project) => {
              const currentIndex = projectIndex;
              projectIndex += 1;
              const isWide = currentIndex % 7 === 0;
              const isTall = currentIndex % 5 === 0;
              const spanClass = isWide ? 'lg:col-span-8' : 'lg:col-span-4';
              const rowClass = isTall ? 'md:row-span-2' : '';

              return (
                <ProjectLink
                  key={project.slug}
                  className={`group relative isolate overflow-hidden bg-[#161617] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 ${spanClass} ${rowClass}`}
                  project={project}
                >
                  {project.cover ? (
                    <>
                      <Image
                        fill
                        alt=''
                        className='object-cover opacity-35 grayscale transition duration-500 group-hover:scale-[1.025] group-hover:opacity-55 group-hover:grayscale-0'
                        sizes='(max-width: 1024px) 50vw, 60vw'
                        src={project.cover}
                      />
                      <span className='absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent' />
                    </>
                  ) : (
                    <span className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.07),transparent_36%)]' />
                  )}

                  <span className='relative flex h-full flex-col justify-between p-5'>
                    <span className='flex items-start justify-between gap-4 text-[10px] tracking-[0.12em] text-zinc-500 uppercase'>
                      <span>
                        {project.organisation ??
                          CATEGORY_SHORT_LABELS[project.category]}
                      </span>
                      <span>
                        {project.slug === 'dryve' ? 'Soon' : project.year}
                      </span>
                    </span>
                    <span>
                      <span className='block max-w-[92%] text-2xl leading-[1.02] font-extralight tracking-[-0.035em] text-zinc-200 transition-transform duration-300 group-hover:-translate-y-1 sm:text-3xl'>
                        {project.title}
                      </span>
                      {project.highlight ? (
                        <span className='mt-2 hidden max-w-xl text-xs leading-relaxed text-zinc-400 group-hover:block lg:block'>
                          {project.highlight}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </ProjectLink>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function CompanyChapters({ projects }: { projects: IProject[] }) {
  const chapters = useMemo(() => buildChapters(projects), [projects]);
  const [activeChapterId, setActiveChapterId] = useState(chapters[0]?.id ?? '');
  const activeChapter =
    chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0];
  const [activeProjectSlug, setActiveProjectSlug] = useState(
    activeChapter?.projects[0]?.slug ?? ''
  );
  const activeProject =
    activeChapter?.projects.find(
      (project) => project.slug === activeProjectSlug
    ) ?? activeChapter?.projects[0];

  const selectChapter = (chapter: IWorkChapter) => {
    setActiveChapterId(chapter.id);
    setActiveProjectSlug(chapter.projects[0]?.slug ?? '');
  };

  if (!activeChapter || !activeProject) {
    return null;
  }

  return (
    <div className='grid min-h-full grid-cols-1 gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-14'>
      <nav
        aria-label='Project chapters'
        className='flex gap-1 overflow-x-auto border-b border-zinc-800 pb-3 lg:flex-col lg:overflow-visible lg:border-r lg:border-b-0 lg:pr-8 lg:pb-0'
      >
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === activeChapter.id;

          return (
            <button
              key={chapter.id}
              aria-pressed={isActive}
              className={`group flex shrink-0 items-center justify-between gap-5 px-3 py-2 text-left text-sm transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 lg:w-full lg:px-0 lg:py-3 ${
                isActive ? 'text-zinc-100' : 'text-zinc-600 hover:text-zinc-300'
              }`}
              onClick={() => selectChapter(chapter)}
              type='button'
            >
              <span className='flex items-center gap-3'>
                <span className='hidden w-5 text-[9px] text-zinc-700 lg:inline'>
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <span>{chapter.label}</span>
              </span>
              <span className='text-[10px] text-zinc-700'>
                {chapter.projects.length}
              </span>
            </button>
          );
        })}
      </nav>

      <section>
        <div className='mb-8 flex items-end justify-between'>
          <div>
            <p className='mb-2 text-[10px] tracking-[0.18em] text-zinc-600 uppercase'>
              Chapter
            </p>
            <h3 className='text-3xl leading-none font-extralight tracking-[-0.04em] text-zinc-100 sm:text-4xl'>
              {activeChapter.label}
            </h3>
          </div>
          <span className='text-[11px] text-zinc-600'>
            {activeChapter.projects.length} projects
          </span>
        </div>

        <div className='mb-10 grid grid-cols-1 border-t border-zinc-800 sm:grid-cols-2 xl:grid-cols-3'>
          {activeChapter.projects.map((project, index) => {
            const isActive = project.slug === activeProject.slug;

            return (
              <button
                key={project.slug}
                aria-pressed={isActive}
                className={`group min-h-[110px] border-b border-zinc-800 p-4 text-left transition-colors focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-zinc-300 sm:border-r ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }`}
                onClick={() => setActiveProjectSlug(project.slug)}
                type='button'
              >
                <span
                  className={`mb-6 block text-[9px] ${
                    isActive ? 'text-zinc-500' : 'text-zinc-700'
                  }`}
                >
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <span className='block text-base leading-tight font-light'>
                  {project.title}
                </span>
              </button>
            );
          })}
        </div>

        <article className='grid gap-10 border-t border-zinc-800 pt-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]'>
          <div>
            <p className='mb-4 text-[10px] tracking-[0.16em] text-zinc-600 uppercase'>
              {getProjectMeta(activeProject)}
            </p>
            <h4 className='max-w-3xl text-4xl leading-[0.98] font-extralight tracking-[-0.05em] text-zinc-100 sm:text-5xl'>
              {activeProject.title}
            </h4>
          </div>
          <div>
            <p className='text-sm leading-relaxed text-zinc-400'>
              {activeProject.description}
            </p>
            {activeProject.slug === 'dryve' ? (
              <span className='mt-8 block text-sm text-zinc-600'>
                Case study coming soon
              </span>
            ) : (
              <ProjectLink
                className='group mt-8 inline-flex items-center gap-2 text-sm text-zinc-300 transition-colors hover:text-zinc-50 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-300'
                project={activeProject}
              >
                Open case study
                <ArrowTopRightIcon className='transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
              </ProjectLink>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function WorkVariantSwitcher({
  currentVariant,
  onChange
}: {
  currentVariant: WorkVariant;
  onChange: (variant: WorkVariant) => void;
}) {
  const activeIndex = WORK_VARIANTS.findIndex(
    (variant) => variant.id === currentVariant
  );
  const activeVariant = WORK_VARIANTS[activeIndex];

  const cycleVariant = (direction: -1 | 1) => {
    const nextIndex =
      (activeIndex + direction + WORK_VARIANTS.length) % WORK_VARIANTS.length;
    onChange(WORK_VARIANTS[nextIndex].id);
  };

  return (
    <div className='absolute bottom-4 left-1/2 z-20 -translate-x-1/2'>
      <div className='flex items-center gap-1 border border-zinc-700 bg-zinc-950/95 p-1 text-zinc-200 shadow-2xl backdrop-blur'>
        <button
          aria-label='Previous work mock'
          className='grid size-9 place-items-center text-zinc-500 transition-colors hover:text-zinc-100 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-zinc-300'
          onClick={() => cycleVariant(-1)}
          type='button'
        >
          <ArrowLeftIcon />
        </button>
        <div
          aria-live='polite'
          className='min-w-[178px] px-3 text-center'
        >
          <span className='block text-[9px] tracking-[0.16em] text-zinc-600 uppercase'>
            Mock {activeIndex + 1} / {WORK_VARIANTS.length}
          </span>
          <span className='block text-xs leading-tight text-zinc-200'>
            {activeVariant.label}
          </span>
        </div>
        <button
          aria-label='Next work mock'
          className='grid size-9 place-items-center text-zinc-500 transition-colors hover:text-zinc-100 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-zinc-300'
          onClick={() => cycleVariant(1)}
          type='button'
        >
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

export default function V2WorkPanelPrototype({
  projects
}: IV2WorkPanelPrototypeProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<WorkVariant>(() => {
    const urlVariant = new URLSearchParams(window.location.search).get(
      'workVariant'
    );
    const parsedVariant = urlVariant ?? undefined;

    return isWorkVariant(parsedVariant) ? parsedVariant : 'index';
  });

  const changeVariant = useCallback((nextVariant: WorkVariant) => {
    setVariant(nextVariant);
    scrollContainerRef.current?.scrollTo({
      behavior: 'auto',
      top: 0
    });

    const url = new URL(window.location.href);
    url.searchParams.set('workVariant', nextVariant);
    window.history.replaceState(window.history.state, '', url);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (
        isTyping ||
        (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
      ) {
        return;
      }

      const activeIndex = WORK_VARIANTS.findIndex(
        (item) => item.id === variant
      );
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const nextIndex =
        (activeIndex + direction + WORK_VARIANTS.length) % WORK_VARIANTS.length;
      changeVariant(WORK_VARIANTS[nextIndex].id);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeVariant, variant]);

  return (
    <div className='relative min-h-0 flex-1'>
      <div
        ref={scrollContainerRef}
        className={`h-full overflow-y-auto ${
          variant === 'stories'
            ? 'snap-y snap-mandatory'
            : 'px-5 pt-3 pb-24 sm:px-8 sm:pt-6 lg:px-16'
        }`}
      >
        {variant === 'index' ? <EditorialIndex projects={projects} /> : null}
        {variant === 'wall' ? <PosterWall projects={projects} /> : null}
        {variant === 'chapters' ? (
          <CompanyChapters projects={projects} />
        ) : null}
        {variant === 'stack' ? (
          <ScrollingProjectStack projects={projects} />
        ) : null}
        {variant === 'timeline' ? (
          <StickyProjectTimeline projects={projects} />
        ) : null}
        {variant === 'stories' ? (
          <ProjectScrollStories projects={projects} />
        ) : null}
      </div>

      {process.env.NODE_ENV !== 'production' ? (
        <WorkVariantSwitcher
          currentVariant={variant}
          onChange={changeVariant}
        />
      ) : null}
    </div>
  );
}
