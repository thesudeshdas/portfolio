'use client';

import { useState, useEffect } from 'react';
import {
  DevProjectCard,
  DevProjectCardSkeleton,
  DevProjectFilter
} from '@/components/index';
import { IDevProjectListItem } from '@/types/dev/dev.types';

export default function DevProjectList({
  initialProjects
}: {
  initialProjects: IDevProjectListItem[];
}) {
  const [activeBadges, setActiveBadges] = useState<string[]>(['Featured']);
  const [filteredItems, setFilteredItems] =
    useState<IDevProjectListItem[]>(initialProjects);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(false);

  useEffect(() => {}, [activeBadges, initialProjects]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const timeoutId = setTimeout(() => {
      let result;

      if (activeBadges.length === 0) {
        result = initialProjects;
      } else if (activeBadges.length === 1 && activeBadges[0] === 'Featured') {
        result = initialProjects.filter((project) => project.featured);
      } else {
        result = initialProjects.filter((project) =>
          project.techStack.find((tech) => activeBadges.includes(tech.name))
        );
      }

      setFilteredItems(result);
      setProjectsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeBadges, initialProjects]);

  return (
    <>
      <DevProjectFilter
        activeBadges={activeBadges}
        setActiveBadges={setActiveBadges}
        setProjectsLoading={setProjectsLoading}
      />

      <div className='flex flex-col gap-8'>
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
    </>
  );
}
