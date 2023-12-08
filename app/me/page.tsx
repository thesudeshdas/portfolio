'use client';

// import next components
import Image from 'next/image';

// import icons
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

// import components
import Journey from './sections/journey';

export default function Me() {
  return (
    <div className='py-12 flex flex-col  gap-12'>
      <div className='flex flex-col gap-6 sm:flex-row sm:justify-center sm:items-center'>
        <figure className='w-full max-w-[250px]'>
          <div className='relative flex-grow aspect-square'>
            <Image
              src='/gojo-compressed.png'
              alt='Sudesh Das'
              fill
              className='object-cover rounded-lg'
            />
          </div>

          {/* <figcaption className='text-xs  text-center'>
            Sudesh Das
            <br />
            The author of this portfolio website
          </figcaption> */}
        </figure>

        <div className='max-w-[640px]'>
          <h2 className='font-bold text-4xl'>
            Sudesh Das <span className='text-sm font-medium'>( Dash )</span>
          </h2>

          <h3>Fullstack Developer @ Talentplace.ai</h3>

          <p className='my-4 text-justify'>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem
            necessitatibus sapiente temporibus minima quod vitae, consectetur
            accusantium porro animi veniam architecto magnam omnis tenetur rem
            totam esse! Dignissimos, quasi eos.
          </p>

          <div className='flex gap-4'>
            <a
              href='https://github.com/thesudeshdas'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FiGithub className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:dark:text-foreground ' />
            </a>

            <a
              href='https://www.linkedin.com/in/thesudeshdas'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FiLinkedin className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:dark:text-foreground ' />
            </a>

            <a href='mailto:sudeshkumardas7@gmail.com'>
              <FiMail className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:dark:text-foreground ' />
            </a>
          </div>
        </div>
      </div>

      <Journey />
    </div>
  );
}

// Pic & bio

// Experience stepper journey

// faqs

// contact
