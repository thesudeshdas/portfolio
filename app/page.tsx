// import next components
import Image from 'next/image';

import { socialLinks } from '@/data/social/social.data';

export default function Home() {
  return (
    <main className='flex flex-col gap-12 py-12'>
      <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center'>
        <figure className='w-full max-w-[150px]'>
          <div className='relative aspect-square grow'>
            <Image
              src='/DP.svg'
              alt='Sudesh Das'
              fill
              className='rounded-lg border-2 object-cover'
            />
          </div>
        </figure>

        <div className='w-full'>
          <h2 className='text-4xl'>
            Sudesh Das <span className='text-sm'>( Dash )</span>
          </h2>

          <h3>Software Engineer | Amateur Storyteller</h3>

          <p className='my-4'>
            I enjoy creating. So I became a programmer.
            <br />
            Other than this, I love football, bikes, video games and music.
            Wanna chat?
          </p>

          <div className='flex gap-4'>
            {socialLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.url}
                  target={link.name === 'Email' ? undefined : '_blank'}
                  rel={
                    link.name === 'Email' ? undefined : 'noopener noreferrer'
                  }
                  aria-label={link.label}
                  className='hover:text-foreground dark:hover:text-foreground transition-colors'
                >
                  <IconComponent className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400' />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <p>
        Hey there 👋 . I am a full stack developer with approximately one and
        half years of experience. I am passionate about building products from
        scratch keeping the UI/UX in mind. The motivation behind these creations
        are to solve the problems I face in real life.
      </p>
    </main>
  );
}

// currently working, currently building, recently wrote
