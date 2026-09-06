'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type FormEvent, useEffect, useId, useState } from 'react';

import { trackEvent } from '@/lib/analytics';

type NewsletterState = 'closed' | 'error' | 'form' | 'submitting' | 'success';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AUTO_CLOSE_SECONDS = 5;

export default function V2Newsletter() {
  const inputId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [state, setState] = useState<NewsletterState>('closed');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(AUTO_CLOSE_SECONDS);

  const isOpen = state !== 'closed';
  const hasError = state === 'error';
  const isSubmitting = state === 'submitting';
  const isSuccess = state === 'success';

  useEffect(() => {
    if (!isSuccess) return;

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);
    const timeoutId = window.setTimeout(() => {
      setState('closed');
    }, AUTO_CLOSE_SECONDS * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [isSuccess]);

  function openForm() {
    if (isSubscribed) return;

    setEmail('');
    setErrorMessage('');
    setState('form');
  }

  function showSuccess() {
    setIsSubscribed(true);
    setSecondsRemaining(AUTO_CLOSE_SECONDS);
    setState('success');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!EMAIL_PATTERN.test(email.trim())) {
      setErrorMessage('enter a valid email address.');
      setState('error');
      return;
    }

    setErrorMessage('');
    setState('submitting');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        body: JSON.stringify({
          email,
          website: formData.get('website')
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setErrorMessage(
          result.message?.toLowerCase() ??
            'something went wrong. please try again.'
        );
        setState('error');
        trackEvent('writings.form.submitted', { result: 'error' });
        return;
      }

      setEmail('');
      showSuccess();
      trackEvent('writings.form.submitted', { result: 'success' });
    } catch {
      setErrorMessage('something went wrong. please try again.');
      setState('error');
      trackEvent('writings.form.submitted', { result: 'error' });
    }
  }

  return (
    <>
      <div className='group relative mt-16 mr-3 mb-3'>
        <div
          aria-hidden='true'
          className='absolute inset-0 translate-x-3 translate-y-3 bg-[#737373] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 group-hover:translate-y-1.5 motion-reduce:transition-none'
        />
        <section
          className='relative z-[1] bg-[#171717] px-5 py-6 text-[#f5f5f5] sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-7 sm:py-7 dark:bg-[#e5e5e5] dark:text-[#171717]'
          data-analytics-section='newsletter'
        >
          <div className='max-w-xl'>
            <h2 className='text-xl font-light tracking-[-0.025em] sm:text-2xl'>
              liked what you read?
            </h2>
            <p className='mt-2 text-sm !leading-6 !text-[#bdbdbd] dark:!text-[#525252]'>
              subscribe to get notified when i write something new. no spam,
              pinky promise
            </p>
          </div>

          <button
            className='mt-5 shrink-0 border border-[#f5f5f5] bg-[#f5f5f5] px-5 py-3 text-sm font-medium text-[#171717] transition-colors hover:bg-transparent hover:text-[#f5f5f5] focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--v2-focus)] active:scale-[0.98] disabled:opacity-55 disabled:hover:bg-[#f5f5f5] disabled:hover:text-[#171717] disabled:active:scale-100 sm:mt-0 dark:border-[#171717] dark:bg-[#171717] dark:text-[#e5e5e5] dark:hover:bg-transparent dark:hover:text-[#171717] dark:disabled:hover:bg-[#171717] dark:disabled:hover:text-[#e5e5e5]'
            disabled={isSubscribed}
            type='button'
            onClick={openForm}
          >
            {isSubscribed ? 'subscribed' : 'subscribe'}
          </button>
        </section>
      </div>

      <Dialog.Root
        open={isOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setState('closed');
        }}
      >
        <Dialog.Portal forceMount>
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                key='newsletter-modal-layer'
                animate={{ opacity: 1 }}
                className='pointer-events-none fixed inset-0 z-[15000]'
                exit={{ opacity: 0 }}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
              >
                <button
                  aria-label='close newsletter dialog'
                  className='pointer-events-auto absolute inset-0 bg-black/70 backdrop-blur-[2px]'
                  type='button'
                  onClick={() => setState('closed')}
                />

                <Dialog.Content
                  forceMount
                  aria-describedby='newsletter-description'
                  className='pointer-events-auto fixed top-1/2 left-1/2 z-[10] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 focus:outline-none'
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') event.stopPropagation();
                  }}
                >
                  <motion.div
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className='relative border border-[var(--v2-border)] bg-[var(--v2-surface-elevated)] p-6 text-[var(--v2-text-strong)] shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8'
                    initial={
                      shouldReduceMotion
                        ? false
                        : { opacity: 0, scale: 0.96, y: 12 }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.26,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    <Dialog.Close asChild>
                      <button
                        aria-label='close newsletter dialog'
                        className='absolute top-4 right-4 grid size-8 place-items-center text-[var(--v2-text-muted)] transition-colors hover:bg-[var(--v2-surface)] hover:text-[var(--v2-text-strong)] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--v2-focus)] active:scale-[0.96]'
                        type='button'
                      >
                        <Cross2Icon
                          aria-hidden='true'
                          className='size-4'
                        />
                      </button>
                    </Dialog.Close>

                    {isSuccess ? (
                      <div className='py-2 pr-8'>
                        <Dialog.Title className='text-3xl font-light tracking-[-0.035em] sm:text-4xl'>
                          you are on the list.
                        </Dialog.Title>
                        <Dialog.Description
                          className='mt-4 max-w-sm text-sm !leading-6 text-[var(--v2-text)] sm:text-base sm:!leading-7'
                          id='newsletter-description'
                        >
                          see on the next one. ciao
                        </Dialog.Description>
                        <p
                          aria-live='polite'
                          className='mt-5 text-xs !text-[var(--v2-text-muted)]'
                        >
                          this modal will auto close in {secondsRemaining}{' '}
                          {secondsRemaining === 1 ? 'second' : 'seconds'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Dialog.Title className='pr-10 text-3xl font-light tracking-[-0.035em] sm:text-4xl'>
                          get notified
                        </Dialog.Title>
                        <Dialog.Description
                          className='mt-4 max-w-sm text-sm !leading-6 text-[var(--v2-text)]'
                          id='newsletter-description'
                        >
                          i will send an email when there is new material for
                          you to enjoy. you can unsubscribe anytime
                        </Dialog.Description>

                        <form
                          className='mt-7'
                          noValidate
                          onSubmit={handleSubmit}
                        >
                          <div
                            aria-hidden='true'
                            className='absolute -left-[9999px]'
                          >
                            <label htmlFor={`${inputId}-website`}>
                              website
                            </label>
                            <input
                              autoComplete='off'
                              id={`${inputId}-website`}
                              name='website'
                              tabIndex={-1}
                              type='text'
                            />
                          </div>

                          <label
                            className='block text-sm text-[var(--v2-text-strong)]'
                            htmlFor={inputId}
                          >
                            email address
                          </label>
                          <input
                            autoFocus
                            aria-describedby={`${inputId}-error`}
                            aria-invalid={hasError}
                            autoComplete='email'
                            className={`mt-2 w-full border bg-[var(--v2-surface)] px-4 py-3 text-base text-[var(--v2-text-strong)] transition-colors outline-none placeholder:text-[var(--v2-text-muted)] focus:border-[var(--v2-focus)] disabled:opacity-55 ${
                              hasError
                                ? 'border-red-600 dark:border-red-400'
                                : 'border-[var(--v2-border)]'
                            }`}
                            disabled={isSubmitting}
                            id={inputId}
                            inputMode='email'
                            name='email'
                            placeholder='you@example.com'
                            type='email'
                            value={email}
                            onChange={(event) => {
                              setEmail(event.target.value);
                              if (hasError) {
                                setErrorMessage('');
                                setState('form');
                              }
                            }}
                          />
                          <p
                            aria-live='polite'
                            className='mt-2 min-h-5 text-sm text-red-700 dark:text-red-300'
                            id={`${inputId}-error`}
                            role={hasError ? 'alert' : undefined}
                          >
                            {hasError ? errorMessage : ''}
                          </p>
                          <button
                            className='mt-4 w-full bg-[var(--v2-text-strong)] px-5 py-3 text-sm font-medium text-[var(--v2-page-bg)] transition-opacity hover:opacity-85 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--v2-focus)] active:scale-[0.98] disabled:opacity-55'
                            disabled={isSubmitting}
                            type='submit'
                          >
                            {isSubmitting ? 'subscribing...' : 'subscribe'}
                          </button>
                        </form>
                      </>
                    )}
                  </motion.div>
                </Dialog.Content>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
