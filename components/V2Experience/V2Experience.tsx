'use client';

import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import {
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiYoutube
} from 'react-icons/fi';
import { Noto_Emoji, Outfit } from 'next/font/google';

import V2AttributionPopover from './V2AttributionPopover';
import V2IntroAnimation from './V2IntroAnimation';
import V2MusicPlayer from './V2MusicPlayer';
import V2WorkHoverDevPanel from './V2WorkHoverDevPanel';
import {
  DEFAULT_V2_CORNER_SETTINGS,
  getV2CornerDelay,
  type V2CornerSettings
} from './v2-corner.settings';
import {
  DEFAULT_V2_WORK_HOVER_SETTINGS,
  IS_V2_WORK_HOVER_DEV_PANEL_ENABLED,
  type V2WorkHoverNumericSettingKey,
  type V2WorkHoverSettings
} from './v2-work-hover.settings';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700']
});

const notoEmoji = Noto_Emoji({
  subsets: ['emoji'],
  weight: '400'
});

const socialLinks = [
  {
    href: 'https://www.linkedin.com/in/thesudeshdas',
    icon: FiLinkedin,
    label: 'LinkedIn'
  },
  {
    href: 'https://github.com/thesudeshdas',
    icon: FiGithub,
    label: 'GitHub'
  },
  {
    href: 'https://www.instagram.com/heywhoisdash',
    icon: FiInstagram,
    label: 'Instagram'
  },
  {
    href: 'https://www.youtube.com/@heywhoisdash',
    icon: FiYoutube,
    label: 'YouTube'
  },
  {
    href: 'mailto:sudeshkumardas7@gmail.com',
    icon: FiMail,
    label: 'Email'
  }
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
  const cornerSettings = DEFAULT_V2_CORNER_SETTINGS;
  const [workHoverSettings, setWorkHoverSettings] =
    useState<V2WorkHoverSettings>(() => ({
      ...DEFAULT_V2_WORK_HOVER_SETTINGS
    }));
  const [areCornersSettled, setAreCornersSettled] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);

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

  const handleWorkHoverSettingChange = useCallback(
    (key: V2WorkHoverNumericSettingKey, value: number) => {
      setWorkHoverSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value
      }));
    },
    []
  );

  const handleWorkHoverReset = useCallback(() => {
    setWorkHoverSettings({ ...DEFAULT_V2_WORK_HOVER_SETTINGS });
  }, []);

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
  const workHoverStyle = {
    '--v2-work-hover-duration': `${workHoverSettings.duration}ms`,
    '--v2-work-hover-scale': workHoverSettings.scale,
    '--v2-work-underline-duration': `${workHoverSettings.underlineDuration}ms`,
    '--v2-work-underline-gap': `${workHoverSettings.underlineGap}px`,
    '--v2-work-underline-width': `${workHoverSettings.underlineWidth}%`
  } as CSSProperties;

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
            areCornersSettled ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{ ...workRevealStyle, lineHeight: '100%' }}
        >
          <span
            data-v2-top-right-corner={areCornersSettled ? 'true' : undefined}
            className='relative inline-block'
            style={workHoverStyle}
          >
            work
          </span>
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
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  aria-label={social.label}
                  className='inline-flex cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.2] motion-reduce:transition-none'
                  href={social.href}
                  rel='noopener noreferrer'
                  target='_blank'
                  title={social.label}
                >
                  <Icon
                    aria-hidden='true'
                    className='size-5 sm:size-6'
                    strokeWidth={0.75}
                  />
                </a>
              );
            })}
          </div>

          <V2AttributionPopover fontClassName={outfit.className} />
        </div>
      </section>

      {IS_V2_WORK_HOVER_DEV_PANEL_ENABLED ? (
        <V2WorkHoverDevPanel
          settings={workHoverSettings}
          onChange={handleWorkHoverSettingChange}
          onReset={handleWorkHoverReset}
        />
      ) : null}
    </main>
  );
}
