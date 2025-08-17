'use client';

// import nextjs components
import Image from 'next/image';
import Link from 'next/link';

// import data
import { NextJS, TailwindCSS } from '@/data/icons/icons.data';

// import components
import SocialLinks from '../SocialLinks/SocialLinks';

export default function Footer() {
  return (
    <div className='mx-auto flex w-full max-w-[1000px] flex-col items-center justify-between gap-8 border-t-[1px] border-zinc-400 px-4 py-4 sm:flex-row dark:border-zinc-500'>
      <div className='flex flex-col items-center gap-2 sm:items-start'>
        <Link href='/'>
          <div className='flex items-center gap-1'>
            <div className='relative h-8 w-8'>
              <Image
                src='/dash-white.png'
                alt='Brand'
                fill
                className='invert dark:invert-0'
              />
            </div>

            <h2 className='font-bold'>Dash</h2>
          </div>
        </Link>

        <p className='text-xs'>© 2025 Sudesh Das. All Rights Reserved.</p>
      </div>

      <div className='flex flex-col items-center gap-3 sm:items-end'>
        <SocialLinks />

        <div className='flex flex-row items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400'>
          <p>Made with</p>

          <a
            href='https://nextjs.org/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <NextJS.logo className='hover:text-foreground dark:hover:text-foreground h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400' />
          </a>

          <p>and</p>

          <a
            href='https://tailwindcss.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <TailwindCSS.logo className='hover:text-foreground dark:hover:text-foreground h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400' />
          </a>
        </div>
      </div>
    </div>
  );
}
