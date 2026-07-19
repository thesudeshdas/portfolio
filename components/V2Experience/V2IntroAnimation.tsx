'use client';

import { useEffect, useRef } from 'react';

import styles from './V2IntroAnimation.module.css';

const SETTINGS = {
  drawDuration: 1800,
  easing: 'cubic-bezier(.65, 0, .35, 1)',
  handSize: 50,
  heyRevealDuration: 600,
  questionDelay: 600,
  questionDotDelay: 300,
  questionSize: 45,
  questionX: 64,
  settleDuration: 600,
  shrinkDuration: 600,
  slideDuration: 800,
  textRevealDuration: 1500,
  waveAngle: 14,
  waveCycle: 2500,
  waveHold: 2000,
  wordDelay: 0
} as const;

type ElementBox = {
  height: number;
  left: number;
  top: number;
  width: number;
};

function place(element: HTMLElement, box: ElementBox) {
  Object.assign(element.style, {
    height: `${box.height}px`,
    left: `${box.left}px`,
    top: `${box.top}px`,
    transform: 'none',
    width: `${box.width}px`
  });
}

function currentBox(element: HTMLElement): ElementBox {
  const rect = element.getBoundingClientRect();

  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width
  };
}

function keyframesBetween(from: ElementBox, to: ElementBox): Keyframe[] {
  return [
    {
      height: `${from.height}px`,
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`
    },
    {
      height: `${to.height}px`,
      left: `${to.left}px`,
      top: `${to.top}px`,
      width: `${to.width}px`
    }
  ];
}

export default function V2IntroAnimation({
  emojiClassName
}: {
  emojiClassName: string;
}) {
  const handGlyphRef = useRef<HTMLSpanElement>(null);
  const handShellRef = useRef<HTMLDivElement>(null);
  const heyTargetRef = useRef<HTMLSpanElement>(null);
  const questionCurveRef = useRef<SVGPathElement>(null);
  const questionDotRef = useRef<SVGCircleElement>(null);
  const questionShellRef = useRef<HTMLDivElement>(null);
  const questionTargetRef = useRef<HTMLSpanElement>(null);
  const wordTargetRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handGlyph = handGlyphRef.current;
    const handShell = handShellRef.current;
    const heyTarget = heyTargetRef.current;
    const questionCurve = questionCurveRef.current;
    const questionDot = questionDotRef.current;
    const questionShell = questionShellRef.current;
    const questionTarget = questionTargetRef.current;
    const wordTarget = wordTargetRef.current;

    if (
      !handGlyph ||
      !handShell ||
      !heyTarget ||
      !questionCurve ||
      !questionDot ||
      !questionShell ||
      !questionTarget ||
      !wordTarget
    ) {
      return;
    }

    let activeController: AbortController | null = null;
    let isComplete = false;
    let resizeFrame = 0;

    const initialHandBox = (): ElementBox => {
      const size = window.innerHeight * (SETTINGS.handSize / 100);

      return {
        height: size,
        left: (window.innerWidth - size) / 2,
        top: (window.innerHeight - size) / 2,
        width: size
      };
    };

    const handAfterTargetBox = (target: HTMLElement): ElementBox => {
      const targetBox = target.getBoundingClientRect();
      const size = targetBox.height * 1.08;

      return {
        height: size,
        left: targetBox.right - size * 0.1,
        top: targetBox.top + (targetBox.height - size) / 2,
        width: size
      };
    };

    const initialQuestionBox = (): ElementBox => {
      const height = window.innerHeight * (SETTINGS.questionSize / 100);
      const width = height * (2 / 3);

      return {
        height,
        left: window.innerWidth * (SETTINGS.questionX / 100) - width / 2,
        top: (window.innerHeight - height) / 2,
        width
      };
    };

    const finalQuestionBox = (): ElementBox => {
      const target = questionTarget.getBoundingClientRect();
      const height = target.height * 1.08;
      const width = height * (2 / 3);

      return {
        height,
        left: target.left + (target.width - width) / 2,
        top: target.top + (target.height - height) / 2,
        width
      };
    };

    const sleep = (duration: number, signal: AbortSignal) =>
      new Promise<boolean>((resolve) => {
        const timeoutId = window.setTimeout(() => {
          resolve(!signal.aborted);
        }, duration);

        signal.addEventListener(
          'abort',
          () => {
            window.clearTimeout(timeoutId);
            resolve(false);
          },
          { once: true }
        );
      });

    const animate = async (
      element: Element,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
      signal: AbortSignal
    ) => {
      const animation = element.animate(keyframes, options);
      const cancelAnimation = () => animation.cancel();
      signal.addEventListener('abort', cancelAnimation, { once: true });

      try {
        await animation.finished;

        if (signal.aborted) {
          return false;
        }

        animation.commitStyles();
        animation.cancel();
        return true;
      } catch {
        return false;
      } finally {
        signal.removeEventListener('abort', cancelAnimation);
      }
    };

    const resetStage = () => {
      heyTarget.style.opacity = '0';
      questionTarget.style.opacity = '0';
      wordTarget.style.maskPosition = '100% 0';
      wordTarget.style.webkitMaskPosition = '100% 0';
      handShell.style.opacity = '1';
      questionShell.style.opacity = '0';
      questionCurve.style.opacity = '0';
      questionCurve.style.strokeDashoffset = '1';
      questionCurve.style.strokeLinecap = 'butt';
      questionDot.style.transform = 'scale(0)';
      handGlyph.style.transform = 'rotate(0deg)';
      place(handShell, initialHandBox());
      place(questionShell, initialQuestionBox());
    };

    const showFinalStage = () => {
      heyTarget.style.opacity = '1';
      questionTarget.style.opacity = '0';
      wordTarget.style.maskPosition = '0% 0';
      wordTarget.style.webkitMaskPosition = '0% 0';
      handShell.style.opacity = '0';
      questionShell.style.opacity = '1';
      questionCurve.style.opacity = '1';
      questionCurve.style.strokeDashoffset = '0';
      questionCurve.style.strokeLinecap = 'round';
      questionDot.style.transform = 'scale(1)';
      place(questionShell, finalQuestionBox());
      isComplete = true;
    };

    const revealText = async (signal: AbortSignal) => {
      const handKeyframes = keyframesBetween(
        currentBox(handShell),
        handAfterTargetBox(wordTarget)
      ).map((keyframe, index) => ({
        ...keyframe,
        opacity: index === 0 ? 1 : 0
      }));

      const [handMoved, textShown] = await Promise.all([
        animate(
          handShell,
          handKeyframes,
          {
            duration: SETTINGS.textRevealDuration,
            easing: SETTINGS.easing,
            fill: 'forwards'
          },
          signal
        ),
        animate(
          wordTarget,
          [
            { maskPosition: '100% 0', webkitMaskPosition: '100% 0' },
            { maskPosition: '0% 0', webkitMaskPosition: '0% 0' }
          ],
          {
            duration: SETTINGS.textRevealDuration,
            easing: SETTINGS.easing,
            fill: 'forwards'
          },
          signal
        )
      ]);

      return handMoved && textShown;
    };

    const play = async () => {
      activeController?.abort();
      activeController = new AbortController();
      const { signal } = activeController;
      isComplete = false;
      resetStage();

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        showFinalStage();
        return;
      }

      const wave = handGlyph.animate(
        [
          { easing: 'ease', offset: 0, transform: 'rotate(0deg)' },
          {
            easing: 'ease',
            offset: 0.1,
            transform: `rotate(${SETTINGS.waveAngle}deg)`
          },
          {
            easing: 'ease',
            offset: 0.2,
            transform: `rotate(-${SETTINGS.waveAngle * (4 / 7)}deg)`
          },
          {
            easing: 'ease',
            offset: 0.3,
            transform: `rotate(${SETTINGS.waveAngle}deg)`
          },
          {
            easing: 'ease',
            offset: 0.4,
            transform: `rotate(-${SETTINGS.waveAngle * (2 / 7)}deg)`
          },
          {
            easing: 'ease',
            offset: 0.5,
            transform: `rotate(${SETTINGS.waveAngle * (5 / 7)}deg)`
          },
          { easing: 'ease', offset: 0.6, transform: 'rotate(0deg)' },
          { offset: 1, transform: 'rotate(0deg)' }
        ],
        {
          duration: SETTINGS.waveCycle,
          easing: 'linear',
          iterations: 1
        }
      );
      const cancelWave = () => wave.cancel();
      signal.addEventListener('abort', cancelWave, { once: true });

      if (!(await sleep(SETTINGS.waveHold, signal))) {
        return;
      }

      wave.cancel();
      signal.removeEventListener('abort', cancelWave);
      handGlyph.style.transform = 'rotate(0deg)';

      if (
        !(await animate(
          handShell,
          keyframesBetween(
            currentBox(handShell),
            handAfterTargetBox(heyTarget)
          ),
          {
            duration: SETTINGS.shrinkDuration,
            easing: SETTINGS.easing,
            fill: 'forwards'
          },
          signal
        ))
      ) {
        return;
      }

      const [heyShown, handSettled] = await Promise.all([
        animate(
          heyTarget,
          [{ opacity: 0 }, { opacity: 1 }],
          {
            duration: SETTINGS.heyRevealDuration,
            easing: 'ease-in-out',
            fill: 'forwards'
          },
          signal
        ),
        sleep(SETTINGS.slideDuration, signal)
      ]);

      if (!heyShown || !handSettled) {
        return;
      }

      if (!(await sleep(SETTINGS.wordDelay, signal))) {
        return;
      }

      if (!(await revealText(signal))) {
        return;
      }

      if (!(await sleep(SETTINGS.questionDelay, signal))) {
        return;
      }

      questionShell.style.opacity = '1';
      const curveDuration = SETTINGS.drawDuration * 0.8;
      const dotDuration = SETTINGS.drawDuration * 0.2;

      if (
        !(await animate(
          questionCurve,
          [
            {
              offset: 0,
              opacity: 0,
              strokeDashoffset: 1,
              strokeLinecap: 'butt'
            },
            {
              offset: 0.08,
              opacity: 0,
              strokeDashoffset: 0.82,
              strokeLinecap: 'butt'
            },
            {
              offset: 0.081,
              opacity: 1,
              strokeDashoffset: 0.818,
              strokeLinecap: 'round'
            },
            {
              offset: 1,
              opacity: 1,
              strokeDashoffset: 0,
              strokeLinecap: 'round'
            }
          ],
          {
            duration: curveDuration,
            easing: 'ease-in-out',
            fill: 'forwards'
          },
          signal
        ))
      ) {
        return;
      }

      if (!(await sleep(SETTINGS.questionDotDelay, signal))) {
        return;
      }

      if (
        !(await animate(
          questionDot,
          [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
          {
            duration: dotDuration,
            easing: 'cubic-bezier(.22, 1, .36, 1)',
            fill: 'forwards'
          },
          signal
        ))
      ) {
        return;
      }

      if (
        !(await animate(
          questionShell,
          keyframesBetween(currentBox(questionShell), finalQuestionBox()),
          {
            duration: SETTINGS.settleDuration,
            easing: SETTINGS.easing,
            fill: 'forwards'
          },
          signal
        ))
      ) {
        return;
      }

      isComplete = true;
    };

    const handleResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        if (isComplete) {
          place(questionShell, finalQuestionBox());
          return;
        }

        void play();
      });
    };

    void document.fonts.ready.then(() => {
      void play();
    });
    window.addEventListener('resize', handleResize);

    return () => {
      activeController?.abort();
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.root}>
      <h1
        aria-label='hey, who is Dash?'
        className='text-4xl leading-none font-medium text-zinc-100 sm:text-5xl lg:text-6xl'
      >
        <span
          ref={heyTargetRef}
          className={styles.hey}
          aria-hidden='true'
        >
          hey,{' '}
        </span>
        <span
          ref={wordTargetRef}
          className={styles.word}
          aria-hidden='true'
        >
          who is Dash
        </span>
        <span
          ref={questionTargetRef}
          className={styles.questionTarget}
          aria-hidden='true'
        >
          ?
        </span>
      </h1>

      <div
        ref={handShellRef}
        className={styles.handShell}
        aria-hidden='true'
      >
        <span
          ref={handGlyphRef}
          className={`${styles.handGlyph} ${emojiClassName}`}
        >
          &#x1f44b;&#xfe0e;
        </span>
      </div>

      <div
        ref={questionShellRef}
        className={styles.questionShell}
        aria-hidden='true'
      >
        <svg viewBox='0 0 100 150'>
          <path
            ref={questionCurveRef}
            className={styles.questionCurve}
            pathLength='1'
            d='M 24 31 C 26 10, 49 4, 68 12 C 88 21, 89 47, 72 60 C 61 69, 51 71, 50 88'
          />
          <circle
            ref={questionDotRef}
            className={styles.questionDot}
            cx='50'
            cy='124'
            r='8'
          />
        </svg>
      </div>
    </div>
  );
}
