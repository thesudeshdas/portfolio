'use client';

// import react
import { useEffect, useState } from 'react';

// import components
import {
  DevProjectCard,
  DevProjectFilter,
  DevProjectCardSkeleton
} from '@/components/index';

// import data
import { devProjectList } from './dev.data';

// import types
import { IDevProjectListItem } from '@/types/dev/dev.types';

export default function Dev() {
  const [activeBadges, setActiveBadges] = useState<string[]>(['Featured']);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);
  const [filteredItems, setFilteredItems] = useState<IDevProjectListItem[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const timeoutId = setTimeout(() => {
      let result;

      if (activeBadges.length === 0) {
        result = devProjectList;
      } else if (activeBadges.length === 1 && activeBadges[0] === 'Featured') {
        result = devProjectList.filter((project) => project.featured);
      } else {
        result = devProjectList.filter((project) =>
          project.techStack.find((tech) => activeBadges.includes(tech.name))
        );
      }

      setFilteredItems(result);
      setProjectsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeBadges]);

  return (
    <div className='py-12 flex flex-col gap-12'>
      <div className='flex flex-col gap-4'>
        <h2 className='font-bold text-4xl'>Creation</h2>

        <p>
          Passionate about building from scratch, these are just a few of my
          projects that I have worked on. Currently I am working on{' '}
          <a
            href='https://github.com/thesudeshdas/catalyst'
            target='_blank'
            rel='noopener noreferrer'
            className='underline font-semibold'
          >
            Catalyst
          </a>
          , a developer portfolio platform built for devs to show off what they
          have built
        </p>
      </div>

      <DevProjectFilter
        activeBadges={activeBadges}
        setActiveBadges={setActiveBadges}
      />

      {projectsLoading ? (
        <>
          <DevProjectCardSkeleton />

          <DevProjectCardSkeleton />
        </>
      ) : (
        filteredItems?.map((project: IDevProjectListItem) => (
          <DevProjectCard
            key={project.id}
            projectDetails={project}
          />
        ))
      )}
    </div>
  );
}
