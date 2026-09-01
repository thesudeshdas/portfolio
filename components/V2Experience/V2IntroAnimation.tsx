'use client';

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import styles from './V2IntroAnimation.module.css';
import V2IntroDevPanel from './V2IntroDevPanel';
import {
  DEFAULT_V2_INTRO_SETTINGS,
  IS_V2_INTRO_DEV_PANEL_ENABLED,
  IS_V2_QUESTION_FOCUS_MODE,
  type V2IntroSettings
} from './v2-intro.settings';

type ElementBox = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type IdiomStage = 'hidden' | 'first' | 'second';

const QUESTION_VISIBLE_LEFT_RATIO = 0.15;
const IDIOM_SECOND_LINE_DELAY_MS = 1800;
const IS_IDIOM_REVEAL_ENABLED = false;

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

function tracerTransform(path: SVGPathElement, progress: number) {
  const pathLength = path.getTotalLength();
  const start = path.getPointAtLength(0);
  const point = path.getPointAtLength(pathLength * progress);

  return `translate(${point.x - start.x}px, ${point.y - start.y}px)`;
}

function tracerKeyframes(path: SVGPathElement): Keyframe[] {
  const sampleCount = 60;

  return Array.from({ length: sampleCount + 1 }, (_, index) => {
    const progress = index / sampleCount;

    return {
      offset: progress,
      transform: tracerTransform(path, progress)
    };
  });
}

export default function V2IntroAnimation({
  emojiClassName,
  fontClassName,
  isDimmed = false,
  isQuestionHoverEnabled = false,
  isQuestionHovered = false,
  onComplete,
  onStart,
  playFullAnimation,
  questionZoneHeight,
  questionZoneWidth,
  replayToken = 0,
  showQuestionHoverZone = false
}: {
  emojiClassName: string;
  fontClassName?: string;
  isDimmed?: boolean;
  isQuestionHoverEnabled?: boolean;
  isQuestionHovered?: boolean;
  onComplete?: () => void;
  onStart?: () => void;
  playFullAnimation: boolean;
  questionZoneHeight: number;
  questionZoneWidth: number;
  replayToken?: number;
  showQuestionHoverZone?: boolean;
}) {
  const [internalReplayToken, setInternalReplayToken] = useState(0);
  const [idiomStage, setIdiomStage] = useState<IdiomStage>('hidden');
  const [settings, setSettings] = useState<V2IntroSettings>(() => ({
    ...DEFAULT_V2_INTRO_SETTINGS
  }));
  const handGlyphRef = useRef<HTMLSpanElement>(null);
  const handShellRef = useRef<HTMLDivElement>(null);
  const heyTargetRef = useRef<HTMLSpanElement>(null);
  const questionCurveRef = useRef<SVGPathElement>(null);
  const questionDotRef = useRef<HTMLSpanElement>(null);
  const questionShellRef = useRef<HTMLDivElement>(null);
  const questionTargetRef = useRef<HTMLSpanElement>(null);
  const questionTracerRef = useRef<SVGCircleElement>(null);
  const wordTargetRef = useRef<HTMLSpanElement>(null);
  const idiomTimerRef = useRef<number | null>(null);

  const revealIdiom = useCallback(() => {
    if (idiomTimerRef.current !== null) {
      window.clearTimeout(idiomTimerRef.current);
    }

    setIdiomStage('first');
    idiomTimerRef.current = window.setTimeout(() => {
      setIdiomStage('second');
      idiomTimerRef.current = null;
    }, IDIOM_SECOND_LINE_DELAY_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (idiomTimerRef.current !== null) {
        window.clearTimeout(idiomTimerRef.current);
      }
    };
  }, []);

  const handleSettingChange = useCallback(
    (key: Exclude<keyof V2IntroSettings, 'easing'>, value: number) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value
      }));
    },
    []
  );

  const handleEasingChange = useCallback((easing: string) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      easing
    }));
  }, []);

  const handleReplay = useCallback(() => {
    setInternalReplayToken((currentToken) => currentToken + 1);
  }, []);

  const handleReset = useCallback(() => {
    setSettings({ ...DEFAULT_V2_INTRO_SETTINGS });
  }, []);

  useEffect(() => {
    const handGlyph = handGlyphRef.current;
    const handShell = handShellRef.current;
    const heyTarget = heyTargetRef.current;
    const questionCurve = questionCurveRef.current;
    const questionDot = questionDotRef.current;
    const questionShell = questionShellRef.current;
    const questionTarget = questionTargetRef.current;
    const questionTracer = questionTracerRef.current;
    const wordTarget = wordTargetRef.current;

    if (
      !handGlyph ||
      !handShell ||
      !heyTarget ||
      !questionCurve ||
      !questionDot ||
      !questionShell ||
      !questionTarget ||
      !questionTracer ||
      !wordTarget
    ) {
      return;
    }

    let activeController: AbortController | null = null;
    let isDisposed = false;
    let isComplete = false;
    let resizeFrame = 0;

    const initialHandBox = (): ElementBox => {
      const size = window.innerHeight * (settings.handSize / 100);

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
      const height = window.innerHeight * (settings.questionSize / 100);
      const width = height * (2 / 3);
      const target = questionTarget.getBoundingClientRect();

      return {
        height,
        left: Math.max(
          window.innerWidth * (settings.questionX / 100) - width / 2,
          target.left - width * QUESTION_VISIBLE_LEFT_RATIO
        ),
        top: (window.innerHeight - height) / 2,
        width
      };
    };

    const finalQuestionBox = (): ElementBox => {
      const target = questionTarget.getBoundingClientRect();
      const height = target.height * 1.2;
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
      handShell.style.opacity = '0';
      questionShell.style.opacity = '0';
      questionCurve.style.opacity = '0';
      questionCurve.style.strokeDashoffset = '1';
      questionCurve.style.strokeLinecap = 'round';
      questionDot.style.display = 'none';
      questionDot.style.opacity = '0';
      questionDot.style.transform = 'translate(-50%, -50%) scale(0)';
      questionTracer.style.opacity = '0';
      questionTracer.style.transform = 'translate(0, 0)';
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
      questionDot.style.display = 'block';
      questionDot.style.opacity = '1';
      questionDot.style.transform = 'translate(-50%, -50%) scale(1)';
      questionTracer.style.opacity = '0';
      place(questionShell, finalQuestionBox());
      isComplete = true;
      onComplete?.();
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
            duration: settings.textRevealDuration,
            easing: settings.easing,
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
            duration: settings.textRevealDuration,
            easing: settings.easing,
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
      onStart?.();

      if (!playFullAnimation) {
        showFinalStage();
        return;
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        showFinalStage();
        return;
      }

      if (IS_V2_QUESTION_FOCUS_MODE) {
        heyTarget.style.opacity = '1';
        wordTarget.style.maskPosition = '0% 0';
        wordTarget.style.webkitMaskPosition = '0% 0';
        handShell.style.opacity = '0';
      } else {
        const wave = handGlyph.animate(
          [
            { easing: 'ease', offset: 0, transform: 'rotate(0deg)' },
            {
              easing: 'ease',
              offset: 0.1,
              transform: `rotate(${settings.waveAngle}deg)`
            },
            {
              easing: 'ease',
              offset: 0.2,
              transform: `rotate(-${settings.waveAngle * (4 / 7)}deg)`
            },
            {
              easing: 'ease',
              offset: 0.3,
              transform: `rotate(${settings.waveAngle}deg)`
            },
            {
              easing: 'ease',
              offset: 0.4,
              transform: `rotate(-${settings.waveAngle * (2 / 7)}deg)`
            },
            {
              easing: 'ease',
              offset: 0.5,
              transform: `rotate(${settings.waveAngle * (5 / 7)}deg)`
            },
            { easing: 'ease', offset: 0.6, transform: 'rotate(0deg)' },
            { offset: 1, transform: 'rotate(0deg)' }
          ],
          {
            duration: settings.waveCycle,
            easing: 'linear',
            iterations: 1
          }
        );
        const cancelWave = () => wave.cancel();
        signal.addEventListener('abort', cancelWave, { once: true });

        const [handShown, handHeld] = await Promise.all([
          animate(
            handShell,
            [{ opacity: 0 }, { opacity: 1 }],
            {
              duration: settings.handFadeDuration,
              easing: 'ease-out',
              fill: 'forwards'
            },
            signal
          ),
          sleep(settings.waveHold, signal)
        ]);

        if (!handShown || !handHeld) {
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
              duration: settings.shrinkDuration,
              easing: settings.easing,
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
              duration: settings.heyRevealDuration,
              easing: 'ease-in-out',
              fill: 'forwards'
            },
            signal
          ),
          sleep(settings.slideDuration, signal)
        ]);

        if (!heyShown || !handSettled) {
          return;
        }

        if (!(await sleep(settings.wordDelay, signal))) {
          return;
        }

        if (!(await revealText(signal))) {
          return;
        }
      }

      if (!(await sleep(settings.questionDelay, signal))) {
        return;
      }

      questionShell.style.opacity = '1';
      const curveDuration = settings.drawDuration * 0.8;
      const dotDuration = settings.drawDuration * 0.2;

      if (
        !(await animate(
          questionTracer,
          [{ opacity: 0 }, { opacity: 1 }],
          {
            duration: settings.tracerFadeDuration,
            easing: 'ease-out',
            fill: 'forwards'
          },
          signal
        ))
      ) {
        return;
      }

      questionCurve.style.opacity = '1';
      const [curveDrawn, tracerMoved] = await Promise.all([
        animate(
          questionCurve,
          [
            {
              offset: 0,
              opacity: 1,
              strokeDashoffset: 1,
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
        ),
        animate(
          questionTracer,
          tracerKeyframes(questionCurve),
          {
            duration: curveDuration,
            easing: 'ease-in-out',
            fill: 'forwards'
          },
          signal
        )
      ]);

      if (!curveDrawn || !tracerMoved) {
        return;
      }

      if (
        !(await animate(
          questionTracer,
          [{ opacity: 1 }, { opacity: 0 }],
          {
            duration: settings.tracerFadeDuration,
            easing: 'ease-in',
            fill: 'forwards'
          },
          signal
        ))
      ) {
        return;
      }

      if (!(await sleep(settings.questionDotDelay, signal))) {
        return;
      }

      questionDot.style.display = 'block';
      if (
        !(await animate(
          questionDot,
          [
            {
              opacity: 0,
              transform: 'translate(-50%, -50%) scale(0)'
            },
            {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1)'
            }
          ],
          {
            duration: dotDuration,
            easing: settings.easing,
            fill: 'forwards'
          },
          signal
        ))
      ) {
        return;
      }

      if (!(await sleep(settings.questionSettleDelay, signal))) {
        return;
      }

      if (
        !(await animate(
          questionShell,
          keyframesBetween(currentBox(questionShell), finalQuestionBox()),
          {
            duration: settings.settleDuration,
            easing: settings.easing,
            fill: 'forwards'
          },
          signal
        ))
      ) {
        return;
      }

      isComplete = true;
      onComplete?.();
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
      if (!isDisposed) {
        void play();
      }
    });
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      activeController?.abort();
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    fontClassName,
    internalReplayToken,
    onComplete,
    onStart,
    playFullAnimation,
    replayToken,
    settings
  ]);

  return (
    <div
      className={styles.root}
      style={{
        opacity: isDimmed ? 0.2 : 1,
        transition: 'opacity 300ms ease-out'
      }}
    >
      <h1
        aria-label='hey, who is Dash?'
        className={`${styles.spotlightExclusion} ${
          fontClassName ?? ''
        } text-[5rem] leading-none font-medium text-[var(--v2-text-strong)]`}
      >
        <span
          ref={heyTargetRef}
          className={styles.hey}
          aria-hidden='true'
          style={IS_V2_QUESTION_FOCUS_MODE ? { opacity: 1 } : undefined}
        >
          hey,{' '}
        </span>
        <span
          ref={wordTargetRef}
          className={styles.word}
          aria-hidden='true'
          style={
            IS_V2_QUESTION_FOCUS_MODE
              ? { maskPosition: '0% 0', WebkitMaskPosition: '0% 0' }
              : undefined
          }
        >
          who is Dash
        </span>
        <span
          className={styles.questionHoverAnchor}
          style={
            {
              '--v2-question-zone-height': `${questionZoneHeight}px`,
              '--v2-question-zone-width': `${questionZoneWidth}px`
            } as CSSProperties
          }
        >
          <span
            ref={questionTargetRef}
            className={styles.questionTarget}
            aria-hidden='true'
          >
            ?
          </span>
          {IS_IDIOM_REVEAL_ENABLED ? (
            <button
              aria-label='Reveal idiom'
              data-v2-question-hover-zone='true'
              disabled={!isQuestionHoverEnabled}
              className={`${styles.questionHoverZone} ${
                showQuestionHoverZone ? styles.questionHoverZoneVisible : ''
              } ${
                isQuestionHoverEnabled ? styles.questionHoverZoneEnabled : ''
              }`}
              onClick={revealIdiom}
              type='button'
            />
          ) : (
            <span
              aria-hidden='true'
              data-v2-question-hover-zone='true'
              className={`${styles.questionHoverZone} ${
                showQuestionHoverZone ? styles.questionHoverZoneVisible : ''
              } ${
                isQuestionHoverEnabled ? styles.questionHoverZoneEnabled : ''
              }`}
            />
          )}
        </span>
      </h1>

      {IS_IDIOM_REVEAL_ENABLED && idiomStage !== 'hidden' ? (
        <>
          <p
            aria-hidden='true'
            className={`${styles.idiom} ${fontClassName ?? ''}`}
          >
            <span
              className={`${styles.idiomLine} ${
                idiomStage === 'first' ? styles.idiomLineVisible : ''
              }`}
            >
              curiousity killed the cat
            </span>
            <span
              className={`${styles.idiomLine} ${
                idiomStage === 'second' ? styles.idiomLineVisible : ''
              }`}
            >
              satisfaction brought it back
            </span>
          </p>
          <span
            aria-live='polite'
            className='sr-only'
          >
            {idiomStage === 'first'
              ? 'curiousity killed the cat'
              : 'satisfaction brought it back'}
          </span>
        </>
      ) : null}

      <div
        ref={handShellRef}
        className={styles.handShell}
        aria-hidden='true'
        style={IS_V2_QUESTION_FOCUS_MODE ? { opacity: 0 } : undefined}
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
        className={`${styles.questionShell} ${
          isQuestionHovered ? styles.questionShellHovered : ''
        }`}
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
            ref={questionTracerRef}
            className={styles.questionTracer}
            cx='24'
            cy='31'
            r={settings.tracerSize}
          />
        </svg>
        <span
          ref={questionDotRef}
          className={styles.questionDot}
        />
      </div>

      {IS_V2_INTRO_DEV_PANEL_ENABLED ? (
        <V2IntroDevPanel
          settings={settings}
          onChange={handleSettingChange}
          onEasingChange={handleEasingChange}
          onReplay={handleReplay}
          onReset={handleReset}
        />
      ) : null}
    </div>
  );
}
