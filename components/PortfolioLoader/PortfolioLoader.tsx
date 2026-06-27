'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

type LoaderPhase = 'entering' | 'holding' | 'textLeaving' | 'leaving';

const START_DELAY_MS = 100;
const TEXT_FADE_IN_MS = 1200;
const POST_DECRYPT_HOLD_MS = 1000;
const TEXT_EXIT_MS = 1200;
const OVERLAY_EXIT_MS = 900;
const TARGET_DECRYPT_FPS = 120;
const DECRYPT_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,';
const INTRO_TEXT = 'hey, who is Dash?';

type TextStageControls = {
  decryptSpeedMs: number;
  textSizeVh: number;
  scrollIconDelayMs: number;
  scrollIconSpeedMs: number;
  scrollArrowStaggerMs: number;
};

const DEFAULT_CONTROLS: TextStageControls = {
  decryptSpeedMs: 115,
  textSizeVh: 6.4,
  scrollIconDelayMs: 600,
  scrollIconSpeedMs: 3600,
  scrollArrowStaggerMs: 360
};

function SmoothDecryptedText({
  characters,
  isActive,
  speed,
  text
}: {
  characters: string;
  isActive: boolean;
  speed: number;
  text: string;
}) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = textRef.current;
    if (!node || !isActive) {
      return;
    }

    const availableCharacters = characters.split('');
    const durationMs = speed * text.length;
    const frameIntervalMs = 1000 / TARGET_DECRYPT_FPS;
    let animationFrameId = 0;
    let lastFrameMs = 0;
    let startMs = 0;

    const renderFrame = (currentMs: number) => {
      if (startMs === 0) {
        startMs = currentMs;
      }

      if (currentMs - lastFrameMs >= frameIntervalMs) {
        lastFrameMs = currentMs;

        const progress = Math.min((currentMs - startMs) / durationMs, 1);
        const revealedCount = Math.floor(progress * text.length);
        node.textContent = text
          .split('')
          .map((character, index) => {
            if (character === ' ' || index < revealedCount) {
              return character;
            }

            return availableCharacters[
              Math.floor(Math.random() * availableCharacters.length)
            ];
          })
          .join('');

        if (progress === 1) {
          node.textContent = text;
          return;
        }
      }

      animationFrameId = window.requestAnimationFrame(renderFrame);
    };

    animationFrameId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [characters, isActive, speed, text]);

  return (
    <span
      ref={textRef}
      className='inline-block whitespace-pre'
    >
      {text}
    </span>
  );
}

export default function PortfolioLoader({
  isLockedOnTextStage = false,
  onComplete
}: {
  isLockedOnTextStage?: boolean;
  onComplete?: () => void;
}) {
  const [phase, setPhase] = useState<LoaderPhase>('entering');
  const [isMounted, setIsMounted] = useState(true);
  const [isScrollIconVisible, setIsScrollIconVisible] = useState(false);
  const controls = DEFAULT_CONTROLS;

  useEffect(() => {
    setPhase('entering');
    setIsMounted(true);
    setIsScrollIconVisible(false);

    const holdTimer = window.setTimeout(() => {
      setPhase('holding');
    }, START_DELAY_MS);

    const decryptDurationMs = controls.decryptSpeedMs * INTRO_TEXT.length;
    const scrollIconStartMs =
      START_DELAY_MS +
      TEXT_FADE_IN_MS +
      decryptDurationMs +
      controls.scrollIconDelayMs;
    const scrollPromptTimer = window.setTimeout(() => {
      setIsScrollIconVisible(true);
    }, scrollIconStartMs);

    if (isLockedOnTextStage) {
      return () => {
        window.clearTimeout(holdTimer);
        window.clearTimeout(scrollPromptTimer);
      };
    }

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
      window.clearTimeout(scrollPromptTimer);
      window.clearTimeout(textExitTimer);
      window.clearTimeout(overlayExitTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [controls, isLockedOnTextStage, onComplete]);

  if (!isMounted) {
    return null;
  }

  const textStyle = {
    fontSize: `clamp(2.5rem, ${controls.textSizeVh}vh, 5.5rem)`
  } satisfies CSSProperties;

  const scrollIconStyle = {
    '--v2-scroll-animation-ms': `${controls.scrollIconSpeedMs}ms`,
    '--v2-scroll-arrow-delay-1': `${controls.scrollArrowStaggerMs}ms`,
    '--v2-scroll-arrow-delay-2': `${controls.scrollArrowStaggerMs * 2}ms`
  } as CSSProperties;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-zinc-100 transition-opacity duration-[800ms] ease-in-out',
        phase === 'leaving' && 'pointer-events-none opacity-0'
      )}
    >
      <span
        aria-hidden='true'
        style={textStyle}
        className={cn(
          'relative inline-block px-6 text-left text-4xl leading-none font-medium whitespace-nowrap text-zinc-100 opacity-0 transition-opacity duration-[1200ms] ease-in-out',
          phase === 'holding' && 'opacity-100'
        )}
      >
        <span className='invisible whitespace-pre'>{INTRO_TEXT}</span>
        <span className='absolute top-0 left-6 whitespace-pre'>
          <SmoothDecryptedText
            isActive={phase === 'holding'}
            text={INTRO_TEXT}
            speed={controls.decryptSpeedMs}
            characters={DECRYPT_CHARACTERS}
          />
        </span>
      </span>

      {isLockedOnTextStage && (
        <div
          aria-hidden='true'
          className='mt-8 flex flex-col items-center gap-3 text-zinc-500'
          style={scrollIconStyle}
        >
          <div
            className={cn(
              'flex translate-y-4 flex-col items-center gap-3 opacity-0 transition-[opacity,transform] duration-700 ease-out',
              isScrollIconVisible && 'translate-y-0 opacity-100'
            )}
          >
            <span className='relative flex h-10 w-6 justify-center rounded-full border border-zinc-500/80'>
              <span className='v2-scroll-dot mt-2 h-1.5 w-1.5 rounded-full bg-zinc-400' />
            </span>

            <span className='hidden flex-col items-center gap-0.5'>
              <span className='v2-scroll-arrow h-2 w-2 border-r border-b border-zinc-500' />
              <span className='v2-scroll-arrow v2-scroll-arrow-delay-1 h-2 w-2 border-r border-b border-zinc-500' />
              <span className='v2-scroll-arrow v2-scroll-arrow-delay-2 h-2 w-2 border-r border-b border-zinc-500' />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
