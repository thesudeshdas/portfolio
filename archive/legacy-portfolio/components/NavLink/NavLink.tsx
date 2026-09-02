import { cn } from '@/lib/utils';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  text: string;
  direction?: 'backward' | 'forward';
  className?: string;
}

export default function NavLink({
  href,
  text,
  direction = 'forward',
  className
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'text-muted-foreground hover:text-foreground group relative block w-fit items-center gap-2 text-xs transition-all',
        className
      )}
    >
      <div className='flex items-center gap-2'>
        {direction === 'backward' && <DoubleArrowLeftIcon />}
        {text}
        {direction === 'forward' && <DoubleArrowRightIcon />}
      </div>

      <div
        className={cn([
          'bg-foreground absolute mt-1 h-0.5 w-0 transition-all group-hover:w-full',
          {
            'right-0 left-auto': direction === 'backward',
            'right-auto left-0': direction === 'forward'
          }
        ])}
      />
    </Link>
  );
}
