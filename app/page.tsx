import Image from 'next/image';
import SocialLinks from '@/components/SocialLinks/SocialLinks';
import SectionHeader from '@/components/SectionHeader/SectionHeader';
import { getAllPublished } from '@/lib/notion';
import { StoriesContainer } from '@/components/index';

export default async function Home() {
  const publishedPosts = await getAllPublished();

  return (
    <main className='flex flex-col gap-12 py-12'>
      <div className='flex flex-col gap-20 sm:max-w-[600px]'>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center'>
            <figure className='aspect-square h-full max-w-[150px] sm:max-w-full'>
              <div className='relative aspect-square w-[125px]'>
                <Image
                  src='/DP.svg'
                  alt='Sudesh Das'
                  fill
                  className='rounded-lg border-2 object-cover'
                />
              </div>
            </figure>

            <div className='flex w-full flex-col gap-0'>
              <h2 className='text-4xl'>
                Sudesh Das <span className='text-sm'>( Dash )</span>
              </h2>

              <p className='mb-4'>Software Engineer • Amateur Storyteller</p>

              <SocialLinks />
            </div>
          </div>

          <p>
            Code pays the bills, but motorcycles & filmmaking keep me curious.
            Here exploring life — chasing ideas, stories, and the roads. Sharing
            experiments, explorations & experiences.
          </p>
        </div>

        <div className='flex flex-col gap-4'>
          <SectionHeader text='Latest Shenanigans' />

          <div className='bg-muted relative aspect-video w-full max-w-4xl overflow-hidden rounded-lg border'>
            <iframe
              src='https://www.youtube.com/embed/videoseries?list=UUk6BULrAO7SWaSg0Vie-Hqg'
              title='Latest Video from Hey Who Is Dash'
              className='absolute inset-0 h-full w-full'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              allowFullScreen
            />
          </div>
        </div>

        <div className='flex w-full flex-col gap-4'>
          <StoriesContainer
            publishedPosts={publishedPosts}
            storiesListHeader='Latest rants'
            maxStories={3}
          />
        </div>
      </div>
    </main>
  );
}
