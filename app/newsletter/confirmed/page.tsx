import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import Link from 'next/link';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Newsletter subscription'
};

interface INewsletterConfirmedPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function NewsletterConfirmedPage({
  searchParams
}: INewsletterConfirmedPageProps) {
  const { status } = await searchParams;
  const isSuccess = status === 'success';
  const isInvalid = status === 'invalid';
  const title = isSuccess
    ? 'You are subscribed.'
    : isInvalid
    ? 'This link has expired.'
    : 'Something went wrong.';
  const message = isSuccess
    ? 'The next piece of writing will arrive in your inbox.'
    : isInvalid
    ? 'Return to writings and request a fresh confirmation email.'
    : 'Your subscription could not be confirmed. Please try again.';

  return (
    <main
      className={`${outfit.className} v2-page grid min-h-[100dvh] place-items-center bg-[var(--v2-page-bg)] px-6 text-[var(--v2-text)]`}
    >
      <section className='w-full max-w-xl'>
        <p className='mb-5 text-sm text-[var(--v2-text-muted)]'>
          Hey, Who Is Dash?
        </p>
        <h1 className='text-5xl !leading-[1.02] font-extralight tracking-[-0.05em] text-[var(--v2-text-strong)] sm:text-7xl'>
          {title}
        </h1>
        <p className='mt-6 max-w-md text-base !leading-7 text-[var(--v2-text)]'>
          {message}
        </p>
        <Link
          className='mt-9 inline-block text-sm text-[var(--v2-text-strong)] underline decoration-[var(--v2-border)] underline-offset-4 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--v2-focus)]'
          href='/writings'
        >
          Return to writings
        </Link>
      </section>
    </main>
  );
}
