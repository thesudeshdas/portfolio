// import next components
import Image from 'next/image';

// import components
import SocialLinks from '@/components/SocialLinks/SocialLinks';

export default function About() {
  return (
    <div className='flex flex-col gap-12'>
      <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-center'>
        <figure className='w-full max-w-[250px]'>
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
          <h2 className='text-4xl font-bold'>
            Sudesh Das <span className='text-sm font-medium'>( Dash )</span>
          </h2>

          <div className='mt-4'>
            <SocialLinks />
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-4 text-sm font-light md:max-w-[60%]'>
        <p>Hey there 👋 I am Dash.</p>

        <p className=''>
          I am a software engineer; currently working at{' '}
          <a
            href='https://growthx.club/'
            rel='noreferrer'
            target='_blank'
            className='border-foreground border-b-[1px] font-medium'
          >
            GrowthX
          </a>
          .
        </p>

        <p>
          I am an amateur storyteller. I{' '}
          <span
            className='relative inline-block font-medium'
            style={{
              position: 'relative'
            }}
          >
            <span className='relative z-10'>make</span>
            <span
              aria-hidden='true'
              className='pointer-events-none absolute top-1/2 left-0 h-[2px] w-full'
              style={{
                backgroundColor: 'currentColor',
                transform: 'rotate(-12deg)',
                content: '""',
                display: 'block'
              }}
            />
          </span>{' '}
          try making videos on{' '}
          <a
            href='https://www.youtube.com/@heywhoisdash'
            rel='noreferrer'
            target='_blank'
            className='border-foreground border-b-[1px] font-medium'
          >
            YouTube
          </a>{' '}
          about my life and experiences (mainly related to motorcycling).
          Outside of tech and motorcycles, I enjoy football (Hala Madrid!),
          video games and doom-scrolling.
        </p>

        <p>
          If you are someone who has overlapping interest(s), feel free to HMU
          on socials (Most active on emails though)
        </p>
      </div>
    </div>
  );
}
