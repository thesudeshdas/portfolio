import { Skeleton } from '@/components/ui/skeleton';

export default function StoryCardSkeleton() {
  return (
    <article className='bg-card text-card-foreground relative overflow-hidden rounded-lg border shadow-sm'>
      {/* Cover Image Skeleton */}
      <div className='relative h-48 w-full overflow-hidden'>
        <Skeleton className='h-full w-full' />
      </div>

      {/* Content Skeleton */}
      <div className='p-4 sm:p-6'>
        {/* Header with emoji and date */}
        <div className='mb-3 flex items-center justify-between'>
          <Skeleton className='h-6 w-6 rounded sm:h-8 sm:w-8' />
          <Skeleton className='h-3 w-16 sm:h-4 sm:w-20' />
        </div>

        {/* Title */}
        <Skeleton className='mb-3 h-5 w-3/4 sm:h-6' />

        {/* Description */}
        <div className='mb-4 space-y-2'>
          <Skeleton className='h-3 w-full sm:h-4' />
          <Skeleton className='h-3 w-5/6 sm:h-4' />
          <Skeleton className='h-3 w-4/6 sm:h-4' />
        </div>
      </div>
    </article>
  );
}
