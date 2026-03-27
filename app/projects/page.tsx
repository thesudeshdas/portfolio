import { getAllProjects } from '@/lib/projects';
import ProjectSections from './sections/ProjectSections';

export default async function Projects() {
  const projects = await getAllProjects();

  return (
    <div className='flex flex-col gap-8 py-12'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-4xl font-bold'>Projects</h1>
        <p className='text-muted-foreground'>
          Things I&apos;ve built, shipped, broke, and learned from.
        </p>
      </div>

      <ProjectSections projects={projects} />
    </div>
  );
}
