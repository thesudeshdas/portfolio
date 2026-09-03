'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { FiCheck, FiLink, FiShare2 } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { SiLinkedin, SiWhatsapp, SiX } from 'react-icons/si';

interface IV2WritingShareProps {
  slug: string;
  title: string;
}

interface IShareOptionProps {
  href: string;
  icon: IconType;
  label: string;
}

type CopyStatus = 'copied' | 'error' | 'idle';

function ShareOption({ href, icon: Icon, label }: IShareOptionProps) {
  return (
    <a
      aria-label={`Share on ${label}`}
      className='group flex min-w-16 flex-col items-center gap-3 text-xs text-[var(--v2-text-muted)] focus-visible:outline-none'
      data-analytics-link-label={label}
      data-analytics-link-location='writing-share'
      href={href}
      rel='noopener noreferrer'
      target='_blank'
    >
      <span className='grid size-12 place-items-center rounded-full border border-[var(--v2-border)] bg-[var(--v2-surface)] text-[var(--v2-text-strong)] transition duration-200 group-hover:border-[var(--v2-text-muted)] group-focus-visible:outline-1 group-focus-visible:outline-offset-4 group-focus-visible:outline-[var(--v2-focus)] group-active:scale-[0.96]'>
        <Icon
          aria-hidden='true'
          className='size-[18px]'
        />
      </span>
      <span>{label}</span>
    </a>
  );
}

export default function V2WritingShare({ slug, title }: IV2WritingShareProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const shouldReduceMotion = useReducedMotion();
  const shareUrl = `https://www.heywhoisdash.com/writings/${slug}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const whatsappText = encodeURIComponent(`${title} ${shareUrl}`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  };

  return (
    <Dialog.Root
      onOpenChange={(isOpen) => {
        if (isOpen) setCopyStatus('idle');
      }}
    >
      <Dialog.Trigger asChild>
        <button
          className='inline-flex items-center gap-1.5 text-[var(--v2-text-muted)] transition-colors hover:text-[var(--v2-text-strong)] focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--v2-focus)] active:scale-[0.98]'
          type='button'
        >
          <FiShare2
            aria-hidden='true'
            className='size-3.5'
          />
          Share
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            animate={{ opacity: 1 }}
            className='fixed inset-0 z-[14000] bg-black/65 backdrop-blur-[2px]'
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          />
        </Dialog.Overlay>

        <Dialog.Content
          aria-describedby='v2-writing-share-description'
          className='fixed top-1/2 left-1/2 z-[14010] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 focus:outline-none'
          data-analytics-section='writing-share'
          data-v2-writing-share-dialog='true'
          onKeyDown={(event) => {
            if (event.key === 'Escape') event.stopPropagation();
          }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className='relative rounded-2xl border border-[var(--v2-border)] bg-[var(--v2-surface-elevated)] p-5 text-[var(--v2-text-strong)] shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-6'
            initial={
              shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 12 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.26,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <Dialog.Title className='pr-10 text-xl font-light tracking-[-0.02em]'>
              Share
            </Dialog.Title>
            <Dialog.Description
              id='v2-writing-share-description'
              className='sr-only'
            >
              Share {title} or copy its link.
            </Dialog.Description>

            <Dialog.Close asChild>
              <button
                aria-label='Close share dialog'
                className='absolute top-4 right-4 grid size-8 place-items-center rounded-full text-[var(--v2-text-muted)] transition-colors hover:bg-[var(--v2-surface)] hover:text-[var(--v2-text-strong)] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--v2-focus)] active:scale-[0.96]'
                type='button'
              >
                <Cross2Icon
                  aria-hidden='true'
                  className='size-4'
                />
              </button>
            </Dialog.Close>

            <div className='mt-7 flex flex-wrap gap-6 px-1 pb-2'>
              <ShareOption
                href={`https://wa.me/?text=${whatsappText}`}
                icon={SiWhatsapp}
                label='WhatsApp'
              />
              <ShareOption
                href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                icon={SiX}
                label='X'
              />
              <ShareOption
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                icon={SiLinkedin}
                label='LinkedIn'
              />
            </div>

            <div className='mt-6 flex items-center gap-2 rounded-xl border border-[var(--v2-border)] bg-[var(--v2-surface)] p-1.5 pl-3'>
              <FiLink
                aria-hidden='true'
                className='size-4 shrink-0 text-[var(--v2-text-muted)]'
              />
              <input
                readOnly
                aria-label='Writing link'
                className='min-w-0 flex-1 truncate bg-transparent text-sm text-[var(--v2-text)] outline-none selection:bg-[var(--v2-border)]'
                onFocus={(event) => event.currentTarget.select()}
                value={shareUrl}
              />
              <button
                className='inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--v2-text-strong)] px-3 text-xs font-medium whitespace-nowrap text-[var(--v2-page-bg)] transition-opacity hover:opacity-85 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--v2-focus)] active:scale-[0.97]'
                onClick={() => {
                  void handleCopy();
                }}
                type='button'
              >
                {copyStatus === 'copied' ? (
                  <FiCheck
                    aria-hidden='true'
                    className='size-3.5'
                  />
                ) : null}
                {copyStatus === 'copied' ? 'Copied' : 'Copy'}
              </button>
            </div>

            <p
              aria-live='polite'
              className='mt-2 min-h-4 text-xs text-[var(--v2-text-muted)]'
            >
              {copyStatus === 'error'
                ? 'Could not copy automatically. Select the link to copy it.'
                : ''}
            </p>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
