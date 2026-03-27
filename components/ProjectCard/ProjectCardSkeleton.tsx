import { Skeleton } from '../ui/skeleton';

export default function ProjectCardSkeleton() {
  return (
    <div className='flex flex-col items-center gap-6 lg:flex-row'>
      <Skeleton className='relative aspect-video w-full shrink-0 grow sm:max-w-[500px] lg:w-[400px]' />

      <div className='flex w-full grow flex-col items-start gap-3'>
        <div className='flex w-full items-center justify-between'>
          <Skeleton className='h-6 w-[150px]' />

          <Skeleton className='h-6 w-[60px]' />
        </div>

        <div className='flex gap-2'>
          <Skeleton className='h-5 w-[70px]' />

          <Skeleton className='h-5 w-[90px]' />
        </div>

        <ul className='flex shrink-0 flex-row flex-wrap gap-2'>
          <Skeleton className='h-4 w-[50px]' />

          <Skeleton className='h-4 w-[50px]' />

          <Skeleton className='h-4 w-[50px]' />

          <Skeleton className='h-4 w-[50px]' />
        </ul>

        <Skeleton className='h-4 w-full' />

        <Skeleton className='h-4 w-full' />

        <Skeleton className='h-4 w-3/4' />

        <div className='flex w-full gap-2 sm:w-[300px]'>
          <Skeleton className='h-8 w-full grow' />

          <Skeleton className='h-8 w-full grow' />

          <Skeleton className='h-8 w-full grow' />
        </div>
      </div>
    </div>
  );
}
