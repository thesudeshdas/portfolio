// import next components
import Image from 'next/image';

// import icons
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

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
            <a
              href='https://github.com/thesudeshdas'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FiGithub className='hover:text-foreground dark:hover:text-foreground h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400' />
            </a>

            <a
              href='https://www.linkedin.com/in/thesudeshdas'
              target='_blank'
              rel='noopener noreferrer'
            >
              <FiLinkedin className='hover:text-foreground dark:hover:text-foreground h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400' />
            </a>

            <a href='mailto:sudeshkumardas7@gmail.com'>
              <FiMail className='hover:text-foreground dark:hover:text-foreground h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400' />
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
    </main>
  );
}

// currently working, currently building, recently wrote
