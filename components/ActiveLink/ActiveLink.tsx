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
        <p
          className={`${
            pathname === link ? 'font-bold' : 'text-zinc-500 dark:text-zinc-400'
          } group-hover:text-foreground transition-all`}
        >
          {text}
        </p>

        <div
          className={`${
            pathname === link ? 'w-full' : 'w-0'
          } h-0.5 mt-0.5 bg-foreground group-hover:w-full transition-all`}
        ></div>
      </div>
    </Link>
  );
}
