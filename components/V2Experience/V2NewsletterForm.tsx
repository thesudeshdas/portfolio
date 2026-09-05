'use client';

import { type FormEvent, useId, useState } from 'react';

import { trackEvent } from '@/lib/analytics';

type SubmissionState = 'error' | 'idle' | 'submitting' | 'success';

export default function V2NewsletterForm() {
  const formId = useId();
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmissionState('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        body: JSON.stringify({
          email: formData.get('email'),
          website: formData.get('website')
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSubmissionState('error');
        setMessage(result.message ?? 'Something went wrong. Please try again.');
        trackEvent('writings.form.submitted', { result: 'error' });
        return;
      }

      form.reset();
      setSubmissionState('success');
      setMessage(result.message ?? 'Check your inbox to confirm.');
      trackEvent('writings.form.submitted', { result: 'success' });
    } catch {
      setSubmissionState('error');
      setMessage('Something went wrong. Please try again.');
      trackEvent('writings.form.submitted', { result: 'error' });
    }
  }

  return (
    <section className='mt-16 border-t border-[var(--v2-border)] pt-10 pb-4'>
      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:items-end'>
        <div>
          <h2 className='text-3xl !leading-[1.1] font-extralight tracking-[-0.04em] text-[var(--v2-text-strong)] sm:text-4xl'>
            New writing, occasionally.
          </h2>
          <p className='mt-4 max-w-md text-sm !leading-6 text-[var(--v2-text-muted)]'>
            Essays about software, products, and craft. No noise, and you can
            unsubscribe whenever you like.
          </p>
        </div>

        <form
          className='relative'
          onSubmit={handleSubmit}
        >
          <div
            aria-hidden='true'
            className='absolute -left-[9999px]'
          >
            <label htmlFor={`${formId}-website`}>Website</label>
            <input
              autoComplete='off'
              id={`${formId}-website`}
              name='website'
              tabIndex={-1}
              type='text'
            />
          </div>

          <label
            className='mb-2 block text-sm text-[var(--v2-text)]'
            htmlFor={`${formId}-email`}
          >
            Email address
          </label>
          <div className='flex border-b border-[var(--v2-border)] transition-colors focus-within:border-[var(--v2-focus)]'>
            <input
              required
              aria-describedby={`${formId}-status`}
              autoComplete='email'
              className='min-w-0 flex-1 bg-transparent py-3 pr-4 text-base text-[var(--v2-text-strong)] outline-none placeholder:text-[var(--v2-text-muted)] disabled:opacity-50'
              disabled={submissionState === 'submitting'}
              id={`${formId}-email`}
              inputMode='email'
              name='email'
              placeholder='you@example.com'
              type='email'
            />
            <button
              className='shrink-0 px-1 py-3 text-sm font-medium whitespace-nowrap text-[var(--v2-text-strong)] transition-transform focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--v2-focus)] active:scale-[0.98] disabled:opacity-50'
              disabled={submissionState === 'submitting'}
              type='submit'
            >
              {submissionState === 'submitting' ? 'Sending...' : 'Subscribe'}
            </button>
          </div>
          <p
            aria-live='polite'
            className='mt-3 min-h-5 text-sm !leading-5 text-[var(--v2-text-muted)]'
            id={`${formId}-status`}
            role={submissionState === 'error' ? 'alert' : 'status'}
          >
            {message || 'You will confirm your address by email.'}
          </p>
        </form>
      </div>
    </section>
  );
}
