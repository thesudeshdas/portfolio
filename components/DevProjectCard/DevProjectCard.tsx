// import nextjs components
import Image from 'next/image';

// import shadcn components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// import icon
import { CodeIcon, ExternalLinkIcon } from '@radix-ui/react-icons';

// import types
import { IDevProjectListItem } from '@/types/dev/dev.types';
import Link from 'next/link';

// declare props types
interface IDevProjectCardProps {
  projectDetails: IDevProjectListItem;
}

export default function DevProjectCard({
  projectDetails
}: IDevProjectCardProps) {
  const {
    description,
    techStack,
    title,
    live,
    sourceCode,
    image,
    organisation,
    organisationLogo
  } = projectDetails;

  return (
    <div className='flex flex-col items-center gap-6 lg:flex-row'>
      <div className='relative aspect-video w-full shrink-0 grow overflow-hidden rounded-lg border sm:max-w-[500px] lg:w-[400px]'>
        <Image
          src={image}
          alt={title}
          fill
          className='object-cover'
        />
      </div>

      <div className='flex grow flex-col items-start gap-2'>
        <div className='flex w-full items-center justify-between'>
          <h2 className='text-xl font-bold'>{title}</h2>

          {organisation && organisationLogo && (
            <Image
              src={organisationLogo}
              alt={organisation}
              height={24}
              className='invert group-data-[state=open]:invert-0 dark:invert-0 dark:group-data-[state=open]:invert'
            />
          )}
        </div>

        <ul className='flex shrink-0 flex-row flex-wrap gap-2'>
          {techStack?.map((tech) => (
            <Badge
              key={`${title}_${tech.id}`}
              className='text-foreground bg-zinc-100 py-1 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
            >
              {tech.name}
            </Badge>
          ))}
        </ul>

        <p>{description}</p>

        <div className='flex w-full gap-2 sm:w-auto'>
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
              href={sourceCode || ''}
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
