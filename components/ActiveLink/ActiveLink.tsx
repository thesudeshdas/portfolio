'use client';

// import nextjs
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// import types
import { IAppNavLink } from '@/types/navs/navs.types';

// declare prop types
type IActiveLinkProps = Omit<IAppNavLink, 'id'>;

export default function ActiveLink({ link, text }: IActiveLinkProps) {
  const pathname = usePathname();

  return (
    <Link href={link}>
      <div className='group'>
        <span
          className={`${
            pathname === link ? '' : 'text-zinc-500 dark:text-zinc-400'
          } group-hover:text-foreground text-sm transition-all`}
        >
          {text}
        </span>

        <div
          className={`${
            pathname === link ? 'w-full' : 'w-0'
          } bg-foreground mt-0.5 h-0.5 transition-all group-hover:w-full`}
        ></div>
      </div>
    </Link>
  );
}
