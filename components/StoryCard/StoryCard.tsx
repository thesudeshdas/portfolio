import Link from 'next/link';
import Image from 'next/image';
import styles from './StoryCard.module.css';
import { cn } from '@/lib/utils';
import { IStory } from '@/types/story/story.types';

interface StoryCardProps {
  post: IStory;
  comingSoon?: boolean;
  onMouseEnter?: (storyId: string) => void;
  onMouseLeave?: () => void;
  hoveredStory?: string | null;
}

export default function StoryCard({
  post,
  comingSoon = false,
  onMouseEnter,
  onMouseLeave,
  hoveredStory
}: StoryCardProps) {
  const isOtherHovered = hoveredStory !== post.id && hoveredStory !== null;

  return (
    <Link
      href={`/stories/${post.slug}`}
      onMouseEnter={() => onMouseEnter?.(post.id)}
      onMouseLeave={onMouseLeave}
    >
      <article
        className={cn(
          styles.storyCard,
          'relative overflow-hidden rounded-lg transition-all duration-300 focus-within:ring-2',
          isOtherHovered && 'opacity-50'
        )}
      >
        <div className={cn(styles.storyCard)}>
          {/* Cover Image */}
          {post.cover && (
            <div
              className={`${styles.cover} ml-4 grid h-full place-items-center sm:mr-4 sm:ml-0`}
            >
              <div className='relative aspect-square h-24 shrink-0 overflow-hidden rounded-lg sm:h-26'>
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  className='object-cover'
                />
              </div>
            </div>
          )}

          {/* Date */}
          {!comingSoon && (
            <time
              className={cn(
                styles.date,
                'text-muted-foreground self-center text-xs'
              )}
            >
              {post.date}
            </time>
          )}

          {/* Title */}
          <h3
            className={cn(
              styles.title,
              'line-clamp-2 text-xl leading-tight font-semibold transition-colors'
            )}
          >
            {post.title}
          </h3>

          {/* Description */}
          {!comingSoon && (
            <p
              className={cn(
                styles.description,
                'text-foreground/70 line-clamp-2 text-sm leading-relaxed sm:w-3/4'
              )}
            >
              {post.description}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
