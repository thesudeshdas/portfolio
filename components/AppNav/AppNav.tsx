'use client';

// import nextjs components
import Image from 'next/image';
import Link from 'next/link';

// import shadcn components
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// import components

import { ModeToggle, ActiveLink } from '../index';

// import icons
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

// import data
import { appNavLinks } from './appNav.data';

export default function AppNav() {
  return (
    <nav
      className={`h-14 sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900 flex-shrink-0`}
    >
      <div
        className={`h-full w-full flex justify-between  items-center px-4 max-w-[1000px] mx-auto`}
      >
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

            <h2 className='font-bold '>Dash</h2>
          </div>
        </Link>

        <div className='flex items-center gap-1 lg:gap-2'>
          {/* Nav links for laptops & desktops */}
          <ul className='hidden lg:flex gap-4 order-1'>
            {appNavLinks.map(({ id, link, text }) => (
              <li key={id}>
                <ActiveLink
                  link={link}
                  text={text}
                />
              </li>
            ))}
          </ul>

          <div className='order-3 lg:order-2'>
            <ModeToggle />
          </div>

          <a
            href='https://drive.google.com/file/d/1CzVw78rhNPZy7Sck7ct8tAOwYlx57TD6/view?usp=drive_link'
            target='_blank'
            rel='noreferrer'
            className='mr-2 order-2 lg:order-3'
          >
            <Button size='sm'>Resume</Button>
          </a>

          <div className='lg:hidden order-4'>
            <Sheet>
              <SheetTrigger
                asChild
                autoFocus={false}
              >
                <HamburgerMenuIcon className='h-[1.2rem] w-[1.2rem]' />
              </SheetTrigger>

              <SheetContent className='w-[15rem] flex flex-col dark:bg-zinc-900 bg-zinc-50'>
                <Link href='/'>
                  <div className='flex items-center gap-1 absolute left-4 top-2.5'>
                    <div className='h-8 w-8 relative'>
                      <Image
                        src='/dash-white.png'
                        alt='Brand'
                        fill
                        className='invert dark:invert-0'
                      />
                    </div>

                    <h2 className='font-bold '>Dash</h2>
                  </div>
                </Link>

                <ul className='w-fit mt-20 h-full'>
                  {appNavLinks.map(({ id, link, text }) => (
                    <li
                      key={id}
                      className='mb-4'
                    >
                      <ActiveLink
                        link={link}
                        text={text}
                      />
                    </li>
                  ))}
                </ul>

                <div className='flex gap-4 mb-0'>
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

// For transparent navbar - bg-opacity-60 dark:bg-opacity-60 backdrop-blur-sm
