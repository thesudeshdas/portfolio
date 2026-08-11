'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  FiCalendar,
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiYoutube
} from 'react-icons/fi';
import { Noto_Emoji, Outfit } from 'next/font/google';

import V2Cursor from '@/components/V2Cursor/V2Cursor';
import type { IProject } from '@/types/project/project.types';

import V2AttributionPopover from './V2AttributionPopover';
import V2IntroAnimation from './V2IntroAnimation';
import V2MusicPlayer from './V2MusicPlayer';
import V2SocialHoverDevPanel from './V2SocialHoverDevPanel';
import V2SpotlightMosaic from './V2SpotlightMosaic';
import V2WorkPanel from './V2WorkPanel';
import V2WorkPanelDevPanel from './V2WorkPanelDevPanel';
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
  DEFAULT_V2_SPOTLIGHT_SETTINGS,
  type V2SpotlightSettings
} from './v2-spotlight.settings';
import {
  DEFAULT_V2_WORK_HOVER_SETTINGS,
  IS_V2_WORK_HOVER_DEV_PANEL_ENABLED,
  type V2WorkHoverNumericSettingKey,
  type V2WorkHoverSettings
} from './v2-work-hover.settings';
import {
  DEFAULT_V2_WORK_PANEL_SETTINGS,
  IS_V2_WORK_PANEL_DEV_PANEL_ENABLED,
  type V2WorkPanelDirection,
  type V2WorkPanelDirectionSettingKey,
  type V2WorkPanelNumericSettingKey,
  type V2WorkPanelSettings
} from './v2-work-panel.settings';

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
  },
  {
    href: 'https://cal.com/heywhoisdash',
    icon: FiCalendar,
    label: 'Book a meeting'
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

interface IV2ExperienceProps {
  projects: IProject[];
}

export default function V2Experience({ projects }: IV2ExperienceProps) {
  const cornerSettings = DEFAULT_V2_CORNER_SETTINGS;
  const [socialHoverSettings, setSocialHoverSettings] =
    useState<V2SocialHoverSettings>(() => ({
      ...DEFAULT_V2_SOCIAL_HOVER_SETTINGS
    }));
  const [workHoverSettings, setWorkHoverSettings] =
    useState<V2WorkHoverSettings>(() => ({
      ...DEFAULT_V2_WORK_HOVER_SETTINGS
    }));
  const [workPanelSettings, setWorkPanelSettings] =
    useState<V2WorkPanelSettings>(() => ({
      ...DEFAULT_V2_WORK_PANEL_SETTINGS
    }));
  const spotlightSettings: V2SpotlightSettings = DEFAULT_V2_SPOTLIGHT_SETTINGS;
  const isFullIntroEnabled = !IS_V2_SKIP_INITIAL_ANIMATION;
  const introReplayToken = 0;
  const [areCornersSettled, setAreCornersSettled] = useState(
    IS_V2_SKIP_INITIAL_ANIMATION
  );
  const [isIntroComplete, setIsIntroComplete] = useState(
    IS_V2_SKIP_INITIAL_ANIMATION
  );
  const [isIntroInteractionReady, setIsIntroInteractionReady] = useState(
    IS_V2_SKIP_INITIAL_ANIMATION
  );
  const [isHeadlineDimmed, setIsHeadlineDimmed] = useState(false);
  const [isIdeaChaseActive, setIsIdeaChaseActive] = useState(false);
  const [isQuestionHovered, setIsQuestionHovered] = useState(false);
  const [isSpotlightSuppressed, setIsSpotlightSuppressed] = useState(false);
  const [isWorkZoneHovered, setIsWorkZoneHovered] = useState(false);
  const [isWorkPanelOpen, setIsWorkPanelOpen] = useState(false);

  const handleIntroStart = useCallback(() => {
    if (!isFullIntroEnabled) {
      return;
    }

    setAreCornersSettled(false);
    setIsIntroComplete(false);
    setIsIntroInteractionReady(false);
    setIsQuestionHovered(false);
    setIsSpotlightSuppressed(false);
    setIsWorkZoneHovered(false);
  }, [isFullIntroEnabled]);

  const handleIntroComplete = useCallback(() => {
    setIsIntroComplete(true);

    if (!isFullIntroEnabled) {
      setAreCornersSettled(true);
    }
  }, [isFullIntroEnabled]);

  const cornerSettleDelay =
    getV2CornerDelay(cornerSettings, 2) +
    cornerSettings.duration +
    cornerSettings.finalDelay;

  useEffect(() => {
    if (!isFullIntroEnabled || !isIntroComplete) {
      return;
    }

    let interactionTimer: number | null = null;
    const settleTimer = window.setTimeout(() => {
      setAreCornersSettled(true);

      interactionTimer = window.setTimeout(() => {
        setIsIntroInteractionReady(true);
      }, cornerSettings.finalTransitionDuration);
    }, cornerSettleDelay);

    return () => {
      window.clearTimeout(settleTimer);

      if (interactionTimer !== null) {
        window.clearTimeout(interactionTimer);
      }
    };
  }, [
    cornerSettleDelay,
    cornerSettings.finalTransitionDuration,
    isFullIntroEnabled,
    isIntroComplete
  ]);

  const handleSpotlightZonePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const target = event.target;
      const isInsideQuestionZone =
        target instanceof Element &&
        target.closest('[data-v2-question-hover-zone="true"]') !== null;
      const isInsideCornerZone =
        target instanceof Element &&
        target.closest('[data-v2-spotlight-exclusion-zone="true"]') !== null;
      const isInsideWorkZone =
        target instanceof Element &&
        target.closest('[data-v2-work-exclusion-zone="true"]') !== null;

      setIsQuestionHovered((currentValue) =>
        currentValue === isInsideQuestionZone
          ? currentValue
          : isInsideQuestionZone
      );
      setIsSpotlightSuppressed((currentValue) => {
        const nextValue = isInsideQuestionZone || isInsideCornerZone;

        return currentValue === nextValue ? currentValue : nextValue;
      });
      setIsWorkZoneHovered((currentValue) =>
        currentValue === isInsideWorkZone ? currentValue : isInsideWorkZone
      );
    },
    []
  );

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

  const handleWorkPanelOpen = useCallback(() => {
    setIsWorkPanelOpen(true);
  }, []);

  const handleWorkPanelClose = useCallback(() => {
    setIsWorkPanelOpen(false);
  }, []);

  const handleWorkPanelNumericSettingChange = useCallback(
    (key: V2WorkPanelNumericSettingKey, value: number) => {
      setWorkPanelSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value
      }));
    },
    []
  );

  const handleWorkPanelDirectionSettingChange = useCallback(
    (key: V2WorkPanelDirectionSettingKey, value: V2WorkPanelDirection) => {
      setWorkPanelSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value
      }));
    },
    []
  );

  const handleWorkPanelSettingsReset = useCallback(() => {
    setWorkPanelSettings({ ...DEFAULT_V2_WORK_PANEL_SETTINGS });
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
  const settledWorkRevealStyle = {
    ...workRevealStyle,
    opacity: areCornersSettled ? 1 : workRevealStyle.opacity
  };
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
  const settledMusicRevealStyle = {
    ...musicRevealStyle,
    opacity: areCornersSettled ? 1 : musicRevealStyle.opacity
  };
  const cornerContentOpacity = areCornersSettled
    ? cornerSettings.finalOpacity
    : 1;
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
    <main
      className='v2-page min-h-[100dvh] overflow-hidden bg-black p-1.5 text-zinc-200 sm:p-2.5'
      onPointerLeave={() => {
        setIsQuestionHovered(false);
        setIsSpotlightSuppressed(false);
        setIsWorkZoneHovered(false);
      }}
      onPointerMove={handleSpotlightZonePointerMove}
    >
      {isIntroInteractionReady ? <V2Cursor /> : null}

      <section className='relative flex min-h-[calc(100dvh-0.75rem)] items-center justify-center sm:min-h-[calc(100dvh-1.25rem)]'>
        <V2SpotlightMosaic
          isEnabled={isIntroInteractionReady}
          isSuppressed={isSpotlightSuppressed || isIdeaChaseActive}
          isVisibleWhenIdle={false}
          settings={spotlightSettings}
        />

        <span
          aria-haspopup='dialog'
          aria-label='Open work'
          data-v2-content-cursor='true'
          data-v2-hide-cursor='true'
          data-v2-spotlight-exclusion-zone='true'
          data-v2-work-exclusion-zone='true'
          className={`${
            outfit.className
          } v2-corner-item v2-spotlight-exclusion-zone v2-spotlight-exclusion-work absolute top-2.5 right-2.5 origin-top-right text-[24px] font-extralight text-zinc-100 focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-300 motion-reduce:transition-none sm:top-4.5 sm:right-4.5 lg:top-6 lg:right-6 ${
            areCornersSettled ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{ ...settledWorkRevealStyle, lineHeight: '100%' }}
          onClick={handleWorkPanelOpen}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleWorkPanelOpen();
            }
          }}
          role='button'
          tabIndex={areCornersSettled ? 0 : -1}
        >
          <span
            className='v2-corner-visual inline-block'
            style={{
              opacity: cornerContentOpacity,
              transitionDuration: `${cornerSettings.finalTransitionDuration}ms`,
              transitionProperty: 'opacity',
              transitionTimingFunction: cornerSettings.easing
            }}
          >
            <span
              data-v2-top-right-corner={areCornersSettled ? 'true' : undefined}
              className={`relative inline-block ${
                isWorkZoneHovered ? 'v2-work-zone-hovered' : ''
              }`}
              style={workHoverStyle}
            >
              work
            </span>
          </span>
        </span>

        <V2IntroAnimation
          emojiClassName={notoEmoji.className}
          fontClassName={outfit.className}
          isDimmed={isHeadlineDimmed}
          isQuestionHoverEnabled={isIntroInteractionReady}
          isQuestionHovered={isQuestionHovered}
          onComplete={handleIntroComplete}
          onStart={handleIntroStart}
          playFullAnimation={isFullIntroEnabled}
          questionZoneHeight={spotlightSettings.questionZoneHeight}
          questionZoneWidth={spotlightSettings.questionZoneWidth}
          replayToken={introReplayToken}
        />

        <V2MusicPlayer
          autoplayDelayMs={
            getV2CornerDelay(cornerSettings, 2) + cornerSettings.duration
          }
          fontClassName={outfit.className}
          contentOpacity={cornerContentOpacity}
          contentOpacityTransitionMs={cornerSettings.finalTransitionDuration}
          isRevealed={isIntroComplete}
          revealStyle={settledMusicRevealStyle}
        />

        <div
          data-v2-spotlight-exclusion-zone='true'
          className={`v2-corner-item v2-spotlight-exclusion-zone v2-spotlight-exclusion-socials absolute right-2.5 bottom-2.5 flex origin-bottom-right flex-col items-end gap-3 motion-reduce:transition-none sm:right-4.5 sm:bottom-4.5 lg:right-6 lg:bottom-6 ${
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
                  className={`v2-social-link v2-expanded-hit-target inline-flex cursor-pointer ${
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
            onChaseActiveChange={setIsIdeaChaseActive}
            onHeadlineDimChange={setIsHeadlineDimmed}
          />
        </div>
      </section>

      <V2WorkPanel
        fontClassName={outfit.className}
        isOpen={isWorkPanelOpen}
        onClose={handleWorkPanelClose}
        projects={projects}
        settings={workPanelSettings}
        workHoverStyle={workHoverStyle}
      />

      {IS_V2_WORK_PANEL_DEV_PANEL_ENABLED ? (
        <V2WorkPanelDevPanel
          settings={workPanelSettings}
          onDirectionChange={handleWorkPanelDirectionSettingChange}
          onNumericChange={handleWorkPanelNumericSettingChange}
          onReset={handleWorkPanelSettingsReset}
        />
      ) : null}

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
