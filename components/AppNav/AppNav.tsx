'use client';

// import next components
import Image from 'next/image';
import Link from 'next/link';

// import icons
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

// import components
import ActiveLink from '../ActiveLink/ActiveLink';
import ModeToggle from '../ModeToggle/ModeToggle';

// import data
import { appNavLinks } from './appNav.data';
import { socialLinks } from '@/data/social/social.data';

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

        <div className='flex items-center gap-1 lg:gap-2'>
          {/* Nav links for laptops & desktops */}
          <ul className='order-1 hidden gap-4 lg:flex'>
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

          {/* <a
            href='https://drive.google.com/file/d/1CzVw78rhNPZy7Sck7ct8tAOwYlx57TD6/view?usp=drive_link'
            target='_blank'
            rel='noreferrer'
            className='mr-2 order-2 lg:order-3'
          >
            <Button size='sm'>Resume</Button>
          </a> */}

          <div className='order-4 lg:hidden'>
            <Sheet>
              <SheetTrigger
                asChild
                autoFocus={false}
              >
                <HamburgerMenuIcon className='h-[1.2rem] w-[1.2rem]' />
              </SheetTrigger>

              <SheetContent className='flex w-[15rem] flex-col bg-zinc-50 dark:bg-zinc-900'>
                <Link href='/'>
                  <div className='absolute top-2.5 left-4 flex items-center gap-1'>
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

                <ul className='mt-20 h-full w-fit'>
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

                <div className='mb-0 flex gap-4'>
                  {socialLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <a
                        key={link.name}
                        href={link.url}
                        target={link.name === 'Email' ? undefined : '_blank'}
                        rel={
                          link.name === 'Email'
                            ? undefined
                            : 'noopener noreferrer'
                        }
                        aria-label={link.label}
                        className='hover:text-foreground dark:hover:text-foreground transition-colors'
                      >
                        <IconComponent className='h-[1.2rem] w-[1.2rem] text-zinc-500 dark:text-zinc-400' />
                      </a>
                    );
                  })}
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
