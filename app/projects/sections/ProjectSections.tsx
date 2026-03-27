'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { IProject, ProjectCategory } from '@/types/project/project.types';
import ProjectCard from '@/components/ProjectCard/ProjectCard';

const categoryOrder: ProjectCategory[] = [
  'product',
  'work',
  'open-source',
  'personal',
  'graveyard'
];

const categoryConfig: Record<
  ProjectCategory,
  { label: string; description: string }
> = {
  product: {
    label: 'Products',
    description: "Revenue-generating things I'm building"
  },
  work: {
    label: 'Work',
    description: "Professional work for companies I've been part of"
  },
  'open-source': {
    label: 'Open Source',
    description: 'Giving back to the community'
  },
  personal: {
    label: 'Personal',
    description: 'Experiments and explorations'
  },
  graveyard: {
    label: 'Graveyard',
    description: "Ideas that taught me something, even if they didn't survive"
  }
};

interface IProjectSectionsProps {
  projects: IProject[];
}

export default function ProjectSections({ projects }: IProjectSectionsProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | null>(
    null
  );
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const isScrollingRef = useRef(false);

  const grouped = categoryOrder.reduce(
    (acc, category) => {
      const items = projects.filter((p) => p.category === category);
      if (items.length > 0) {
        acc[category] = items;
      }
      return acc;
    },
    {} as Record<ProjectCategory, IProject[]>
  );

  const activeCategories = categoryOrder.filter((cat) => grouped[cat]);

  useEffect(() => {
    if (activeCategories.length > 0 && !activeCategory) {
      setActiveCategory(activeCategories[0]);
    }
  }, [activeCategories, activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const offset = 160;
      let current: ProjectCategory | null = null;

      for (const cat of activeCategories) {
        const el = sectionRefs.current[cat];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            current = cat;
          }
        }
      }

      if (current) {
        setActiveCategory(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategories]);

  const scrollToSection = (category: ProjectCategory) => {
    isScrollingRef.current = true;
    setActiveCategory(category);
    const el = sectionRefs.current[category];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  return (
    <div className='flex flex-col gap-12'>
      <nav className='sticky top-16 z-10 -mx-4 flex gap-2 overflow-x-auto bg-zinc-50/80 px-4 py-3 backdrop-blur-sm sm:top-20 dark:bg-zinc-900/80'>
        {activeCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => scrollToSection(cat)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              activeCategory === cat
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground'
            )}
          >
            {categoryConfig[cat].label}
          </button>
        ))}
      </nav>

      {activeCategories.map((cat) => (
        <section
          key={cat}
          ref={(el) => {
            sectionRefs.current[cat] = el;
          }}
          data-category={cat}
          className='flex scroll-mt-36 flex-col gap-6 sm:scroll-mt-40'
        >
          <div className='flex flex-col gap-1'>
            <h2 className='text-2xl font-bold'>{categoryConfig[cat].label}</h2>
            <p className='text-muted-foreground text-sm'>
              {categoryConfig[cat].description}
            </p>
          </div>

          <div className='flex flex-col gap-8'>
            {grouped[cat].map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
