'use client';

import { DevProjectCard } from '@/components/index';
// import next components
import Image from 'next/image';

// import icons
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { devProjectList } from './dev/dev.data';

export default function Home() {
  return (
    <main className='py-12 flex flex-col gap-12'>
      <div className='flex flex-col gap-6 sm:flex-row sm:justify-center sm:items-center'>
        <figure className='w-full max-w-[250px]'>
          <div className='relative grow aspect-square'>
            <Image
              src='/DP.svg'
              alt='Sudesh Das'
              fill
              className='object-cover rounded-lg border-2'
            />
          </div>
        </figure>

        <div className='w-full'>
          <h2 className='font-bold text-4xl'>
            Sudesh Das <span className='text-sm font-medium'>( Dash )</span>
          </h2>

          <h3>Fullstack Dev | UI Designer </h3>

          <p className='my-4'>
            I like building stuff. So I became a programmer.
            <br />
            Other than this, I love football, bikes, video games and music.
            Wanna chat?
          </p>

          <div className='flex gap-4'>
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
        </div>
      </div>

      <p>
        Hey there 👋 . I am a full stack developer with approximately one and
        half years of experience. I am passionate about building products from
        scratch keeping the UI/UX in mind. The motivation behind these creations
        are to solve the problems I face in real life.
      </p>

      <div className='flex flex-col gap-6'>
        <h2 className='font-bold text-3xl'>Currently building</h2>
        <DevProjectCard projectDetails={devProjectList[2]} />
      </div>
    </main>
  );
}

// currently working, currently building, recently wrote
