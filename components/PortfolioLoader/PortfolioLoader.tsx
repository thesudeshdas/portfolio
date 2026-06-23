'use client';

import { useEffect, useState } from 'react';

import DecryptedText from '@/components/DecryptedText';
import { cn } from '@/lib/utils';

type LoaderPhase = 'entering' | 'holding' | 'textLeaving' | 'leaving';

const START_DELAY_MS = 100;
const TEXT_FADE_IN_MS = 1200;
const DECRYPT_SPEED_MS = 115;
const POST_DECRYPT_HOLD_MS = 1000;
const TEXT_EXIT_MS = 1200;
const OVERLAY_EXIT_MS = 900;
const INTRO_TEXT = 'hey, who is Dash?';
const DECRYPT_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,';

export default function PortfolioLoader({
  onComplete
}: {
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<LoaderPhase>('entering');
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    const holdTimer = window.setTimeout(() => {
      setPhase('holding');
    }, START_DELAY_MS);

    const decryptDurationMs = DECRYPT_SPEED_MS * INTRO_TEXT.length;

    const textExitTimer = window.setTimeout(
      () => {
        setPhase('textLeaving');
      },
      START_DELAY_MS +
        TEXT_FADE_IN_MS +
        decryptDurationMs +
        POST_DECRYPT_HOLD_MS
    );

    const overlayExitTimer = window.setTimeout(
      () => {
        setPhase('leaving');
      },
      START_DELAY_MS +
        TEXT_FADE_IN_MS +
        decryptDurationMs +
        POST_DECRYPT_HOLD_MS +
        TEXT_EXIT_MS
    );

    const unmountTimer = window.setTimeout(
      () => {
        window.dispatchEvent(new Event('portfolio-loader-complete'));
        onComplete?.();
        setIsMounted(false);
      },
      START_DELAY_MS +
        TEXT_FADE_IN_MS +
        decryptDurationMs +
        POST_DECRYPT_HOLD_MS +
        TEXT_EXIT_MS +
        OVERLAY_EXIT_MS
    );

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(textExitTimer);
      window.clearTimeout(overlayExitTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [onComplete]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      aria-hidden='true'
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505] text-zinc-100 transition-opacity duration-[800ms] ease-in-out',
        phase === 'leaving' && 'pointer-events-none opacity-0'
      )}
    >
      <span
        className={cn(
          'px-6 text-center text-2xl font-medium text-zinc-100 opacity-0 transition-opacity duration-[1200ms] ease-in-out sm:text-4xl',
          phase === 'holding' && 'opacity-100'
        )}
      >
        <DecryptedText
          text={INTRO_TEXT}
          speed={DECRYPT_SPEED_MS}
          sequential
          revealDirection='start'
          animateOn='view'
          characters={DECRYPT_CHARACTERS}
        />
      </span>
    </div>
  );
}
