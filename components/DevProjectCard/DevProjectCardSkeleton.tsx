// import shadcn components
import { Skeleton } from '../ui/skeleton';

export default function DevProjectCardSkeleton() {
  return (
    <div className='flex flex-col lg:flex-row gap-6 items-center'>
      <Skeleton className='relative grow aspect-video w-full sm:max-w-[500px] lg:w-[400px] shrink-0 ' />

      <div className='flex flex-col grow gap-3 items-start w-full'>
        <div className='flex items-center justify-between w-full'>
          <Skeleton className='h-6 w-[150px]' />

          <Skeleton className='h-6 w-[100px]' />
        </div>

        <ul className='flex flex-row flex-wrap shrink-0 gap-2'>
          <Skeleton className='h-4 w-[50px]' />

          <Skeleton className='h-4 w-[50px]' />

          <Skeleton className='h-4 w-[50px]' />

          <Skeleton className='h-4 w-[50px]' />
        </ul>

        <Skeleton className='h-4 w-full' />

        <Skeleton className='h-4 w-full' />

        <div className='flex gap-2 w-full sm:w-[200px]'>
          <Skeleton className='h-8 w-full grow' />

          <Skeleton className='h-8 w-full grow' />
        </div>
      </div>
    </div>
  );
}
