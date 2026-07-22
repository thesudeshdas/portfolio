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

import V2Cursor from '@/components/V2Cursor/V2Cursor';

import V2AttributionPopover from './V2AttributionPopover';
import V2IntroAnimation from './V2IntroAnimation';
import V2MusicPlayer from './V2MusicPlayer';
import V2SocialHoverDevPanel from './V2SocialHoverDevPanel';
import V2WorkHoverDevPanel from './V2WorkHoverDevPanel';
import {
  DEFAULT_V2_CORNER_SETTINGS,
  getV2CornerDelay,
  IS_V2_SKIP_INITIAL_ANIMATION,
  type V2CornerSettings
} from './v2-corner.settings';
import {
  DEFAULT_V2_SOCIAL_HOVER_SETTINGS,
  IS_V2_SOCIAL_HOVER_DEV_PANEL_ENABLED,
  type V2SocialHoverNumericSettingKey,
  type V2SocialHoverSettings
} from './v2-social-hover.settings';
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
    href: 'mailto:dash@heywhoisdash.com',
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
  const [socialHoverSettings, setSocialHoverSettings] =
    useState<V2SocialHoverSettings>(() => ({
      ...DEFAULT_V2_SOCIAL_HOVER_SETTINGS
    }));
  const [workHoverSettings, setWorkHoverSettings] =
    useState<V2WorkHoverSettings>(() => ({
      ...DEFAULT_V2_WORK_HOVER_SETTINGS
    }));
  const [areCornersSettled, setAreCornersSettled] = useState(
    IS_V2_SKIP_INITIAL_ANIMATION
  );
  const [isIntroComplete, setIsIntroComplete] = useState(
    IS_V2_SKIP_INITIAL_ANIMATION
  );
  const [isHeadlineDimmed, setIsHeadlineDimmed] = useState(false);

  const handleIntroStart = useCallback(() => {
    if (IS_V2_SKIP_INITIAL_ANIMATION) {
      return;
    }

    setAreCornersSettled(false);
    setIsIntroComplete(false);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIsIntroComplete(true);

    if (IS_V2_SKIP_INITIAL_ANIMATION) {
      setAreCornersSettled(true);
    }
  }, []);

  const cornerSettleDelay =
    getV2CornerDelay(cornerSettings, 2) +
    cornerSettings.duration +
    cornerSettings.finalDelay;

  useEffect(() => {
    if (IS_V2_SKIP_INITIAL_ANIMATION || !isIntroComplete) {
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

  const handleSocialHoverSettingChange = useCallback(
    (key: V2SocialHoverNumericSettingKey, value: number) => {
      setSocialHoverSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value
      }));
    },
    []
  );

  const handleSocialHoverReset = useCallback(() => {
    setSocialHoverSettings({ ...DEFAULT_V2_SOCIAL_HOVER_SETTINGS });
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
  const settledSocialsRevealStyle = {
    ...socialsRevealStyle,
    opacity: areCornersSettled ? 1 : socialsRevealStyle.opacity
  };
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
  const socialHoverStyle = {
    '--v2-social-hover-duration': `${socialHoverSettings.duration}ms`,
    '--v2-social-hover-scale': socialHoverSettings.scale,
    '--v2-social-hover-stroke-width': socialHoverSettings.hoverStrokeWidth,
    '--v2-social-resting-stroke-width': socialHoverSettings.restingStrokeWidth
  } as CSSProperties;

  return (
    <main className='v2-page min-h-[100dvh] bg-black p-1.5 text-zinc-200 sm:p-2.5'>
      <V2Cursor />

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
            data-v2-content-cursor='true'
            data-v2-hide-cursor='true'
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
          isDimmed={isHeadlineDimmed}
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
          style={settledSocialsRevealStyle}
        >
          <div
            aria-label='Social media'
            className='flex items-center gap-3 text-xl leading-none font-medium text-zinc-100 sm:gap-5 sm:text-2xl'
          >
            {socialLinks.map((social) => {
              const Icon = social.icon;
              const opensInNewTab = !social.href.startsWith('mailto:');

              return (
                <a
                  key={social.label}
                  aria-label={social.label}
                  data-v2-content-cursor='true'
                  data-v2-hide-cursor='true'
                  className={`v2-social-link inline-flex cursor-pointer ${
                    areCornersSettled ? 'opacity-20' : 'opacity-100'
                  }`}
                  href={social.href}
                  rel={opensInNewTab ? 'noopener noreferrer' : undefined}
                  style={socialHoverStyle}
                  target={opensInNewTab ? '_blank' : undefined}
                  title={social.label}
                >
                  <Icon
                    aria-hidden='true'
                    className='size-5 sm:size-6'
                    strokeWidth={socialHoverSettings.restingStrokeWidth}
                  />
                </a>
              );
            })}
          </div>

          <V2AttributionPopover
            fontClassName={outfit.className}
            hoverStyle={socialHoverStyle}
            isSettled={areCornersSettled}
            onHeadlineDimChange={setIsHeadlineDimmed}
          />
        </div>
      </section>

      {IS_V2_WORK_HOVER_DEV_PANEL_ENABLED ? (
        <V2WorkHoverDevPanel
          settings={workHoverSettings}
          onChange={handleWorkHoverSettingChange}
          onReset={handleWorkHoverReset}
        />
      ) : null}

      {IS_V2_SOCIAL_HOVER_DEV_PANEL_ENABLED ? (
        <V2SocialHoverDevPanel
          settings={socialHoverSettings}
          onChange={handleSocialHoverSettingChange}
          onReset={handleSocialHoverReset}
        />
      ) : null}
    </main>
  );
}
