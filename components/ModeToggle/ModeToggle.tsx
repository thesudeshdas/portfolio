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
      className='dark:zinc-400 hover:text-foreground text-foreground cursor-pointer hover:bg-transparent sm:text-zinc-500'
    >
      <SunIcon className='h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />

      <MoonIcon className='absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
    </Button>
  );
}
