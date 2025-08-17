'use client';

// import next components
import Image from 'next/image';

// import components
import SocialLinks from '@/components/SocialLinks/SocialLinks';

import { useEffect, useRef } from 'react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.innerWidth >= 640) {
      // sm breakpoint is 640px
      containerRef.current.style.height = `${containerRef.current.clientHeight}px`;
    }
  }, []);

  return (
    <main className='flex flex-col gap-12 py-12'>
      <div className='flex flex-col gap-20 sm:max-w-[600px]'>
        <div
          ref={containerRef}
          className='flex flex-col gap-6'
        >
          <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center'>
            <figure className='aspect-square h-full max-w-[150px] sm:max-w-full'>
              <div className='relative aspect-square grow'>
                <Image
                  src='/DP.svg'
                  alt='Sudesh Das'
                  fill
                  className='rounded-lg border-2 object-cover'
                />
              </div>
            </figure>

            <div className='flex w-full flex-col gap-2'>
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
          <h4 className='text-3xl'>Latest Shenanigans</h4>

          <div className='w-full max-w-4xl'>
            <div className='bg-muted relative aspect-video w-full overflow-hidden rounded-lg border'>
              <iframe
                src='https://www.youtube.com/embed/videoseries?list=UUk6BULrAO7SWaSg0Vie-Hqg'
                title='Latest Video from Hey Who Is Dash'
                className='absolute inset-0 h-full w-full'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
              />
            </div>
          </div>
        </div>

        <div className='flex w-full flex-col gap-4'>
          <h4 className='text-3xl'>Latest Reads</h4>

          <div className='w-full max-w-4xl'>
            <ul className='space-y-4'>
              <li className='border-border border-b pb-3'>
                <a
                  href='/blogs'
                  className='group block'
                >
                  <h5 className='group-hover:text-foreground text-lg font-medium transition-colors'>
                    Building in Public: My Journey as a Developer
                  </h5>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    Sharing the ups and downs of building software in the open
                  </p>
                </a>
              </li>
              <li className='border-border border-b pb-3'>
                <a
                  href='/blogs'
                  className='group block'
                >
                  <h5 className='group-hover:text-foreground text-lg font-medium transition-colors'>
                    Lessons Learned from 100+ Code Reviews
                  </h5>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    Key insights from reviewing code across different projects
                  </p>
                </a>
              </li>
              <li className='border-border border-b pb-3'>
                <a
                  href='/blogs'
                  className='group block'
                >
                  <h5 className='group-hover:text-foreground text-lg font-medium transition-colors'>
                    The Art of Writing Clean Code
                  </h5>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    Principles and practices for maintainable software
                  </p>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

// currently working, currently building, recently wrote
