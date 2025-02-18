'use client';

// import nextjs
import { useTheme } from 'next-themes';

// import shadcn components
import { Button } from '@/components/ui/button';

// import icons
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={
        theme === 'dark' ? () => setTheme('light') : () => setTheme('dark')
      }
      className='text-zinc-500 dark:zinc-400 hover:text-foreground hover:bg-transparent cursor-pointer'
    >
      <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />

      <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
    </Button>
  );
}
