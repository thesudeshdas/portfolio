'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ExternalLinkIcon,
  CodeIcon,
  ArrowRightIcon
} from '@radix-ui/react-icons';
import { IProject } from '@/types/project/project.types';
import { resolveTechStack } from '@/data/icons/techStackMap';

interface IProjectCardProps {
  project: IProject;
}

const statusStyles: Record<string, string> = {
  active:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  maintained:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  sunset: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
};

export default function ProjectCard({ project }: IProjectCardProps) {
  const {
    slug,
    title,
    description,
    category,
    status,
    role,
    highlight,
    year,
    organisation,
    cover,
    live,
    sourceCode,
    techStack
  } = project;

  const resolvedTech = resolveTechStack(techStack);

  return (
    <div className='flex flex-col items-center gap-6 lg:flex-row'>
      <div className='relative aspect-video w-full shrink-0 grow overflow-hidden rounded-lg border sm:max-w-[500px] lg:w-[400px]'>
        {cover ? (
          <Image
            src={cover}
            alt={title}
            fill
            className='object-cover'
          />
        ) : (
          <div className='bg-muted flex h-full w-full items-center justify-center'>
            <span className='text-muted-foreground/50 text-3xl'>
              {title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className='flex w-full grow flex-col items-start gap-2'>
        <div className='flex w-full items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Link
              href={`/projects/${slug}`}
              className='text-xl font-bold hover:underline'
            >
              {title}
            </Link>
            {category === 'work' && organisation && (
              <span className='text-muted-foreground text-sm'>
                @ {organisation}
              </span>
            )}
          </div>
          <Badge
            variant='outline'
            className='shrink-0'
          >
            {year}
          </Badge>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant='secondary'
            className={statusStyles[status]}
          >
            {status}
          </Badge>
          <Badge variant='secondary'>{role}</Badge>
        </div>

        {highlight && (
          <p className='text-muted-foreground text-sm italic'>{highlight}</p>
        )}

        <ul className='flex shrink-0 flex-row flex-wrap gap-2'>
          {resolvedTech.map((tech) => (
            <Badge
              key={`${slug}_${tech.id}`}
              className='text-foreground bg-zinc-100 py-1 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
            >
              {tech.name}
            </Badge>
          ))}
        </ul>

        <p className='line-clamp-3'>{description}</p>

        <div className='flex w-full gap-2 sm:w-auto'>
          <Link
            href={`/projects/${slug}`}
            className='grow'
          >
            <Button
              variant='outline'
              className='w-full'
            >
              View Details
              <ArrowRightIcon className='ml-1 h-4 w-4' />
            </Button>
          </Link>

          {live && (
            <Link
              href={live}
              target='_blank'
              className='grow'
            >
              <Button className='w-full'>
                Live
                <ExternalLinkIcon className='ml-1 h-4 w-4' />
              </Button>
            </Link>
          )}

          {sourceCode && (
            <Link
              href={sourceCode}
              target='_blank'
              className='grow'
            >
              <Button variant='secondary'>
                Source
                <CodeIcon className='ml-1 h-4 w-4' />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
