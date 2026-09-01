'use client';

import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
}

export default function ModeToggle({
  className,
  tabIndex
}: {
  className?: string;
  tabIndex?: number;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = async () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';

    const applyTheme = () => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(newTheme);
      setTheme(newTheme);
    };

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => ViewTransition;
    };

    if (
      !buttonRef.current ||
      !doc.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      applyTheme();
      return;
    }

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        applyTheme();
      });
    });

    try {
      await transition.ready;

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 800,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    } catch {
      // View transition failed — theme already applied
    }
  };

  return (
    <Button
      ref={buttonRef}
      aria-label='Toggle color theme'
      data-v2-content-cursor='true'
      data-v2-hide-cursor='true'
      variant='ghost'
      size='icon'
      tabIndex={tabIndex}
      onClick={handleToggle}
      className={cn(
        'text-foreground relative cursor-pointer hover:bg-transparent sm:text-zinc-500 dark:text-zinc-400 dark:hover:bg-transparent',
        className
      )}
      title='Toggle color theme'
    >
      <SunIcon className='h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />

      <MoonIcon className='absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
    </Button>
  );
}
