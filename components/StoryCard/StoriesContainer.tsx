'use client';

import { IStory } from '@/types/story/story.types';
import StoryCard from './StoryCard';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '../SectionHeader/SectionHeader';
import { usePathname } from 'next/navigation';
import { DoubleArrowRightIcon } from '@radix-ui/react-icons';

interface StoriesContainerProps {
  publishedPosts: IStory[];
  firstPostFeatured?: boolean;
  storiesListHeader?: string;
  maxStories?: number;
}

export default function StoriesContainer({
  publishedPosts,
  firstPostFeatured = false,
  storiesListHeader = 'More Stories',
  maxStories = 4
}: StoriesContainerProps) {
  const pathname = usePathname();

  const firstPublishedPost = publishedPosts[0];

  const [hoveredStory, setHoveredStory] = useState<string | null>(null);

  const isPathNameStories = pathname === '/stories';

  const storiesList = firstPostFeatured
    ? publishedPosts.slice(1, maxStories)
    : publishedPosts.slice(0, maxStories);

  const handleOnMouseEnter = (storyId: string) => {
    setHoveredStory(storyId);
  };
  const handleOnMouseLeave = () => {
    setHoveredStory(null);
  };

  return (
    <main className='col-span-3 mx-auto flex flex-col py-8'>
      {firstPostFeatured && (
        <>
          <SectionHeader
            text='Latest rants'
            className='mb-4'
          />

          <Link
            href={`/stories/${firstPublishedPost.slug}`}
            onMouseEnter={() => handleOnMouseEnter(firstPublishedPost.id)}
            onMouseLeave={handleOnMouseLeave}
            className='mb-20'
          >
            <div className='flex w-full cursor-pointer flex-col'>
              <div className='relative aspect-video h-full w-full overflow-hidden rounded-lg'>
                <Image
                  src={firstPublishedPost.cover ?? ''}
                  alt={firstPublishedPost.title}
                  fill
                  className='object-cover'
                />
              </div>

              <div className='mt-5 flex flex-col-reverse items-start justify-between md:flex-row md:items-center md:gap-2'>
                <h5 className='text-2xl font-medium'>
                  {firstPublishedPost.title}
                </h5>

                <span className='text-muted-foreground text-xs'>
                  {firstPublishedPost.date}
                </span>
              </div>

              <p className='text-muted-foreground line-clamp-2 h-20 w-3/4 pb-3 text-sm'>
                {firstPublishedPost.description}
              </p>
            </div>
          </Link>
        </>
      )}

      {storiesList.length > 0 && (
        <div className='flex items-start justify-between'>
          <SectionHeader
            text={storiesListHeader}
            className='mb-4'
          />

          {!isPathNameStories && storiesList.length > 1 && (
            <Link
              href={'/stories'}
              className='text-muted-foreground hover:text-foreground mt-1 flex items-center gap-3 text-xs transition-all'
            >
              All stories
              <DoubleArrowRightIcon />
            </Link>
          )}
        </div>
      )}

      <div className='flex flex-col gap-14'>
        {storiesList.map((post, index) => (
          <StoryCard
            key={post.id || index + 1}
            post={post}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
            hoveredStory={hoveredStory}
          />
        ))}
      </div>
    </main>
  );
}
