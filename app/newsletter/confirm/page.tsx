import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import Link from 'next/link';

import { verifyNewsletterConfirmationToken } from '@/lib/newsletter';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Confirm newsletter subscription'
};

interface INewsletterConfirmPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function NewsletterConfirmPage({
  searchParams
}: INewsletterConfirmPageProps) {
  const { token } = await searchParams;
  const signingSecret = process.env.NEWSLETTER_SIGNING_SECRET?.trim();
  const isValid =
    typeof token === 'string' &&
    Boolean(signingSecret) &&
    verifyNewsletterConfirmationToken(token, signingSecret ?? '') !== null;

  return (
    <main
      className={`${outfit.className} v2-page grid min-h-[100dvh] place-items-center bg-[var(--v2-page-bg)] px-6 text-[var(--v2-text)]`}
    >
      <section className='w-full max-w-xl'>
        <p className='mb-5 text-sm text-[var(--v2-text-muted)]'>
          Hey, Who Is Dash?
        </p>
        <h1 className='text-5xl !leading-[1.02] font-extralight tracking-[-0.05em] text-[var(--v2-text-strong)] sm:text-7xl'>
          {isValid ? 'One last click.' : 'This link has expired.'}
        </h1>
        <p className='mt-6 max-w-md text-base !leading-7 text-[var(--v2-text)]'>
          {isValid
            ? 'Confirm that you want new writing delivered to your inbox.'
            : 'Return to writings and request a fresh confirmation email.'}
        </p>

        {isValid ? (
          <form
            action='/api/newsletter/confirm'
            className='mt-9'
            method='post'
          >
            <input
              name='token'
              type='hidden'
              value={token}
            />
            <button
              className='bg-[var(--v2-text-strong)] px-5 py-3 text-sm font-medium whitespace-nowrap text-[var(--v2-page-bg)] transition-transform active:scale-[0.98]'
              type='submit'
            >
              Confirm subscription
            </button>
          </form>
        ) : (
          <Link
            className='mt-9 inline-block text-sm text-[var(--v2-text-strong)] underline decoration-[var(--v2-border)] underline-offset-4 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--v2-focus)]'
            href='/writings'
          >
            Return to writings
          </Link>
        )}
      </section>
    </main>
  );
}
