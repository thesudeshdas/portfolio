'use client';

import Image from 'next/image';
import { Outfit } from 'next/font/google';
import { useState } from 'react';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400']
});

function QuestionMark() {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 100 150'
      className='ml-[0.08em] inline-block h-[0.78em] w-[0.52em] overflow-visible'
    >
      <path
        d='M 24 31 C 26 10, 49 4, 68 12 C 88 21, 89 47, 72 60 C 61 69, 51 71, 50 88'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='18'
      />
      <circle
        cx='50'
        cy='124'
        r='12'
        fill='currentColor'
      />
    </svg>
  );
}

export default function MobileSiteBlocker() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <aside
      aria-labelledby='mobile-site-blocker-title'
      aria-modal='true'
      role='dialog'
      className={`${outfit.className} fixed inset-0 z-50 touch-none overflow-hidden bg-black text-zinc-200 md:hidden`}
    >
      <div className='relative mx-auto min-h-[100dvh] w-full max-w-[430px] overflow-hidden px-6 pt-[12dvh]'>
        <div className='relative z-20 text-center'>
          <h1
            id='mobile-site-blocker-title'
            className='text-[clamp(2.25rem,10vw,3rem)] leading-[0.94] font-extralight tracking-[-0.045em] text-zinc-100'
          >
            <span className='block whitespace-nowrap'>mobile version</span>
            <span className='block whitespace-nowrap'>under construction</span>
          </h1>

          <button
            type='button'
            className='mx-auto mt-6 block min-h-11 px-3 text-base leading-none font-light text-zinc-400 underline decoration-zinc-600 underline-offset-8 transition-colors focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-200 active:text-zinc-100'
            onClick={() => setIsDismissed(true)}
          >
            see broken version
          </button>
        </div>

        <div
          aria-hidden='true'
          className='absolute top-[48dvh] left-1/2 h-[92dvh] w-[min(82vw,350px)] -translate-x-1/2'
        >
          <div className='absolute inset-[2.8%_4.8%] overflow-hidden rounded-[13%] bg-zinc-50 text-zinc-950'>
            <div className='absolute top-[18%] left-1/2 w-full -translate-x-1/2 text-center text-[clamp(1.85rem,8vw,2.4rem)] leading-[1.05] font-extralight tracking-[-0.05em]'>
              hey,
              <Image
                src='/noto-waving-hand.svg'
                alt=''
                width={128}
                height={128}
                className='ml-[0.16em] inline-block h-[0.78em] w-[0.78em] -rotate-12 align-[-0.08em]'
              />
              <br />
              who is Dash
              <QuestionMark />
            </div>

            <div className='absolute top-[43%] left-1/2 -translate-x-1/2 text-center text-[clamp(0.9rem,3.8vw,1.1rem)] leading-[1.35] font-light'>
              work
              <br />
              writings
            </div>
          </div>

          <Image
            src='/iphone-15-pro-frame.webp'
            alt=''
            fill
            priority
            sizes='(max-width: 767px) 82vw, 350px'
            className='relative z-10 object-contain object-top'
          />
        </div>
      </div>
    </aside>
  );
}
