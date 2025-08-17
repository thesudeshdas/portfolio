'use client';

// import next components
import Image from 'next/image';
import Link from 'next/link';

// import icons
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

// import components
import ActiveLink from '../ActiveLink/ActiveLink';
import ModeToggle from '../ModeToggle/ModeToggle';
import SocialLinks from '../SocialLinks/SocialLinks';

// import data
import { appNavLinks } from './appNav.data';

// import ui components
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

export default function AppNav() {
  return (
    <nav
      className={`sticky top-0 z-10 h-16 shrink-0 bg-zinc-50 sm:h-20 dark:bg-zinc-900`}
    >
      <div
        className={`mx-auto flex h-full w-full max-w-[1000px] items-center justify-between px-4`}
      >
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

        <div className='flex items-center gap-4'>
          <div className='hidden sm:flex'>
            <ul className='flex items-center gap-8'>
              {appNavLinks.map(({ id, link, text }) => (
                <li key={id}>
                  <ActiveLink
                    link={link}
                    text={text}
                  />
                </li>
              ))}
            </ul>
          </div>

          <ModeToggle />

          <div className='sm:hidden'>
            <Sheet>
              <SheetTrigger asChild>
                <button className='flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700'>
                  <HamburgerMenuIcon className='h-4 w-4' />
                </button>
              </SheetTrigger>

              <SheetContent>
                <ul className='mb-8 flex flex-col gap-4'>
                  {appNavLinks.map(({ id, link, text }) => (
                    <li key={id}>
                      <ActiveLink
                        link={link}
                        text={text}
                      />
                    </li>
                  ))}
                </ul>

                <div className='mb-0'>
                  <SocialLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

// For transparent navbar - bg-opacity-60 dark:bg-opacity-60 backdrop-blur-xs
