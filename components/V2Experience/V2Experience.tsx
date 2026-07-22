'use client';

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiYoutube
} from 'react-icons/fi';
import { Noto_Emoji, Outfit } from 'next/font/google';

import V2AttributionPopover from './V2AttributionPopover';
import V2CornerDevPanel from './V2CornerDevPanel';
import V2IntroAnimation from './V2IntroAnimation';
import V2MusicPlayer from './V2MusicPlayer';
import {
  DEFAULT_V2_CORNER_SETTINGS,
  getV2CornerDelay,
  IS_V2_CORNER_DEV_PANEL_ENABLED,
  type V2CornerAnimationMode,
  type V2CornerNumericSettingKey,
  type V2CornerSettings
} from './v2-corner.settings';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700']
});

const notoEmoji = Noto_Emoji({
  subsets: ['emoji'],
  weight: '400'
});

const socialLabels = [
  { icon: FiLinkedin, label: 'LinkedIn' },
  { icon: FiGithub, label: 'GitHub' },
  { icon: FiInstagram, label: 'Instagram' },
  { icon: FiYoutube, label: 'YouTube' },
  { icon: FiMail, label: 'Email' }
];

function cornerRevealStyle(
  settings: V2CornerSettings,
  isRevealed: boolean,
  isSettled: boolean,
  itemIndex: number,
  slideDirection: -1 | 1
): CSSProperties {
  const isScaleAnimation = settings.animationMode === 'scale';

  return {
    opacity: isRevealed ? (isSettled ? settings.finalOpacity : 1) : 0,
    scale: !isRevealed
      ? isScaleAnimation
        ? settings.startScale
        : settings.revealScale
      : isSettled
      ? settings.finalScale
      : settings.revealScale,
    translate:
      !isScaleAnimation && !isRevealed
        ? `${settings.slideDistance * slideDirection}px 0`
        : '0 0',
    transitionDelay:
      isRevealed && !isSettled
        ? `${getV2CornerDelay(settings, itemIndex)}ms`
        : '0ms',
    transitionDuration: isRevealed
      ? `${isSettled ? settings.finalTransitionDuration : settings.duration}ms`
      : '0ms',
    transitionProperty: isSettled
      ? 'opacity, scale'
      : isScaleAnimation
      ? 'opacity, scale'
      : 'opacity, translate',
    transitionTimingFunction: settings.easing
  };
}

export default function V2Experience() {
  const [cornerSettings, setCornerSettings] = useState<V2CornerSettings>(
    () => ({
      ...DEFAULT_V2_CORNER_SETTINGS
    })
  );
  const [areCornersSettled, setAreCornersSettled] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const replayFrameRef = useRef<number | null>(null);

  const replayCorners = useCallback(() => {
    if (replayFrameRef.current !== null) {
      window.cancelAnimationFrame(replayFrameRef.current);
    }

    setAreCornersSettled(false);
    setIsIntroComplete(false);
    replayFrameRef.current = window.requestAnimationFrame(() => {
      replayFrameRef.current = window.requestAnimationFrame(() => {
        replayFrameRef.current = null;
        setIsIntroComplete(true);
      });
    });
  }, []);

  useEffect(
    () => () => {
      if (replayFrameRef.current !== null) {
        window.cancelAnimationFrame(replayFrameRef.current);
      }
    },
    []
  );

  const handleIntroStart = useCallback(() => {
    setAreCornersSettled(false);
    setIsIntroComplete(false);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIsIntroComplete(true);
  }, []);

  const cornerSettleDelay =
    getV2CornerDelay(cornerSettings, 2) +
    cornerSettings.duration +
    cornerSettings.finalDelay;

  useEffect(() => {
    if (!isIntroComplete) {
      return;
    }

    const settleTimer = window.setTimeout(() => {
      setAreCornersSettled(true);
    }, cornerSettleDelay);

    return () => window.clearTimeout(settleTimer);
  }, [cornerSettleDelay, isIntroComplete]);

  const handleCornerSettingChange = useCallback(
    (key: V2CornerNumericSettingKey, value: number) => {
      setCornerSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value
      }));
      replayCorners();
    },
    [replayCorners]
  );

  const handleCornerAnimationModeChange = useCallback(
    (animationMode: V2CornerAnimationMode) => {
      setCornerSettings((currentSettings) => ({
        ...currentSettings,
        animationMode
      }));
      replayCorners();
    },
    [replayCorners]
  );

  const handleCornerEasingChange = useCallback(
    (easing: string) => {
      setCornerSettings((currentSettings) => ({
        ...currentSettings,
        easing
      }));
      replayCorners();
    },
    [replayCorners]
  );

  const handleCornerReset = useCallback(() => {
    setCornerSettings({ ...DEFAULT_V2_CORNER_SETTINGS });
    replayCorners();
  }, [replayCorners]);

  const workRevealStyle = cornerRevealStyle(
    cornerSettings,
    isIntroComplete,
    areCornersSettled,
    0,
    1
  );
  const socialsRevealStyle = cornerRevealStyle(
    cornerSettings,
    isIntroComplete,
    areCornersSettled,
    1,
    1
  );
  const musicRevealStyle = cornerRevealStyle(
    cornerSettings,
    isIntroComplete,
    areCornersSettled,
    2,
    -1
  );

  return (
    <main
      data-v2-content-cursor='true'
      className='v2-page min-h-[100dvh] bg-black p-1.5 text-zinc-200 sm:p-2.5'
    >
      <section className='relative flex min-h-[calc(100dvh-0.75rem)] items-center justify-center sm:min-h-[calc(100dvh-1.25rem)]'>
        <span
          className={`${
            outfit.className
          } v2-corner-item absolute top-2.5 right-2.5 origin-top-right text-[24px] font-extralight text-zinc-100 motion-reduce:transition-none sm:top-4.5 sm:right-4.5 lg:top-6 lg:right-6 ${
            isIntroComplete ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{ ...workRevealStyle, lineHeight: '100%' }}
        >
          work
        </span>

        <V2IntroAnimation
          emojiClassName={notoEmoji.className}
          fontClassName={outfit.className}
          onComplete={handleIntroComplete}
          onStart={handleIntroStart}
        />

        <V2MusicPlayer
          autoplayDelayMs={
            getV2CornerDelay(cornerSettings, 2) + cornerSettings.duration
          }
          fontClassName={outfit.className}
          isRevealed={isIntroComplete}
          revealStyle={musicRevealStyle}
        />

        <div
          className={`v2-corner-item absolute right-2.5 bottom-2.5 flex origin-bottom-right flex-col items-end gap-3 motion-reduce:transition-none sm:right-4.5 sm:bottom-4.5 lg:right-6 lg:bottom-6 ${
            isIntroComplete ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={socialsRevealStyle}
        >
          <div
            aria-label='Social media'
            className='flex items-center gap-3 text-xl leading-none font-medium text-zinc-100 sm:gap-5 sm:text-2xl'
          >
            {socialLabels.map((social) => {
              const Icon = social.icon;

              return (
                <span
                  key={social.label}
                  aria-label={social.label}
                  title={social.label}
                >
                  <Icon
                    aria-hidden='true'
                    className='size-5 sm:size-6'
                    strokeWidth={0.75}
                  />
                </span>
              );
            })}
          </div>

          <V2AttributionPopover fontClassName={outfit.className} />
        </div>
      </section>

      {IS_V2_CORNER_DEV_PANEL_ENABLED ? (
        <V2CornerDevPanel
          settings={cornerSettings}
          onChange={handleCornerSettingChange}
          onAnimationModeChange={handleCornerAnimationModeChange}
          onEasingChange={handleCornerEasingChange}
          onReplay={replayCorners}
          onReset={handleCornerReset}
        />
      ) : null}
    </main>
  );
}
