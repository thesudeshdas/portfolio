'use client';

// import nextjs components
import Image from 'next/image';
import Link from 'next/link';

// import icons
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

// import data
import { NextJS, TailwindCSS } from '@/data/icons/icons.data';

export default function Footer() {
  return (
    <div className='flex flex-col sm:flex-row justify-between items-center py-4 px-4 border-t-[1px] border-zinc-400 dark:border-zinc-500 gap-8 max-w-[1000px] mx-auto w-full'>
      <div className='flex flex-col items-center sm:items-start gap-2'>
        <Link href='/'>
          <div className='flex items-center gap-1'>
            <div className='h-8 w-8 relative'>
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

        <p className='text-xs'>
          © 2023 - 2024 Sudesh Das. All Rights Reserved.
        </p>
      </div>

      <div className='flex flex-col items-center sm:items-end gap-3'>
        <div className='flex items-center gap-4'>
          <a
            href='https://github.com/thesudeshdas'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FiGithub className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-foreground ' />
          </a>

          <a
            href='https://www.linkedin.com/in/thesudeshdas'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FiLinkedin className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-foreground ' />
          </a>

          <a href='mailto:sudeshkumardas7@gmail.com'>
            <FiMail className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-foreground ' />
          </a>
        </div>

        <div className='flex flex-row text-xs items-center gap-1 text-zinc-500 dark:text-zinc-400'>
          <p>Made in</p>

          <a
            href='https://nextjs.org/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <NextJS.logo className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-foreground ' />
          </a>

          <p>and</p>

          <a
            href='https://tailwindcss.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <TailwindCSS.logo className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-foreground ' />
          </a>
        </div>
      </div>
    </div>
  );
}
