'use client';

import { devProjectList } from './dev.data';
import { DevProjectCard } from '@/components/index';

export default function Dev() {
  return (
    <div className='py-12 flex flex-col gap-12'>
      {devProjectList.map((project) => (
        <DevProjectCard
          key={project.id}
          projectDetails={project}
        />
      ))}
    </div>
  );
}
