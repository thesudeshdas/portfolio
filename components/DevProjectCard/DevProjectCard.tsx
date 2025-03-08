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
    <div className='flex flex-col lg:flex-row gap-6 items-center'>
      <div className='relative grow aspect-video w-full sm:max-w-[500px] lg:w-[400px] shrink-0 overflow-hidden = rounded-lg'>
        <Image
          src={image}
          alt={title}
          fill
          className='object-cover'
        />
      </div>

      <div className='flex flex-col grow gap-2 items-start'>
        <div className='flex items-center justify-between w-full'>
          <h2 className='font-bold text-xl'>{title}</h2>

          {organisation && organisationLogo && (
            <Image
              src={organisationLogo}
              alt={organisation}
              height={24}
              className='group-data-[state=open]:invert-0 invert dark:group-data-[state=open]:invert dark:invert-0'
            />
          )}
        </div>

        <ul className='flex flex-row flex-wrap shrink-0 gap-2'>
          {techStack?.map((tech) => (
            <Badge
              key={`${title}_${tech.id}`}
              className='py-1 bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700'
            >
              {tech.name}
            </Badge>
          ))}
        </ul>

        <p>{description}</p>

        <div className='flex gap-2 w-full sm:w-auto'>
          {live && (
            <Link
              href={live}
              target='_blank'
              className='grow'
            >
              <Button className='w-full'>
                Live
                <ExternalLinkIcon className='ml-1 w-4 h-4' />
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
                <CodeIcon className='ml-1 w-4 h-4' />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
