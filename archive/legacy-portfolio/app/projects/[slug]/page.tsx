import ReactMarkdown from 'react-markdown';
import { getProjectBySlug } from '@/lib/projects';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import styles from './Entry.module.css';
import Image from 'next/image';
import { NavLink } from '@/components/index';
import { Badge } from '@/components/ui/badge';
import TechStackDisplay from './TechStackDisplay';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found'
    };
  }

  return {
    title: project.metadata.title,
    description: project.metadata.description,
    openGraph: {
      title: project.metadata.title,
      description: project.metadata.description,
      ...(project.metadata.cover && {
        images: [{ url: project.metadata.cover }]
      })
    }
  };
}

export default async function ProjectDetail({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const {
    title,
    description,
    category,
    status,
    role,
    year,
    organisation,
    highlight,
    cover,
    techStack,
    live,
    sourceCode
  } = project.metadata;

  return (
    <main>
      <NavLink
        href='/projects'
        text='All projects'
        direction='backward'
        className='mt-12 mb-6 sm:mt-20'
      />

      <div className='flex flex-col gap-2'>
        <h1 className='text-4xl font-bold'>{title}</h1>

        <p className='text-muted-foreground'>{description}</p>

        <div className='mt-2 flex flex-wrap items-center gap-2'>
          <Badge variant='secondary'>{category}</Badge>
          <Badge variant='outline'>{status}</Badge>
          <span className='text-muted-foreground text-sm'>{role}</span>
          <span className='text-muted-foreground text-sm'>&middot;</span>
          <span className='text-muted-foreground text-sm'>{year}</span>
          {organisation && (
            <>
              <span className='text-muted-foreground text-sm'>&middot;</span>
              <span className='text-muted-foreground text-sm'>
                {organisation}
              </span>
            </>
          )}
        </div>
      </div>

      {highlight && (
        <blockquote className='border-primary bg-muted my-6 rounded-md border-l-4 px-4 py-3 italic'>
          {highlight}
        </blockquote>
      )}

      {cover && (
        <div className='relative my-8 aspect-video'>
          <Image
            src={cover}
            alt={title}
            fill
            className='rounded-lg border-2 object-cover'
          />
        </div>
      )}

      {techStack.length > 0 && (
        <div className='my-6'>
          <TechStackDisplay techStack={techStack} />
        </div>
      )}

      {(live || sourceCode) && (
        <div className='flex flex-wrap gap-3'>
          {live && (
            <a
              href={live}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors'
            >
              Live
            </a>
          )}
          {sourceCode && (
            <a
              href={sourceCode}
              target='_blank'
              rel='noopener noreferrer'
              className='border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors'
            >
              Source Code
            </a>
          )}
        </div>
      )}

      <section className={styles['entry-main']}>
        <ReactMarkdown>{project.markdown}</ReactMarkdown>
      </section>
    </main>
  );
}
