'use client';

import Image from 'next/image';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';

import V2MusicDevPanel from './V2MusicDevPanel';
import { v2MusicTracks } from './v2-music.data';
import {
  DEFAULT_V2_MUSIC_SETTINGS,
  IS_V2_MUSIC_AUTOPLAY_ENABLED,
  IS_V2_MUSIC_DEV_PANEL_ENABLED,
  type V2AlbumBorderVisibility,
  type V2MusicPlayerSettings
} from './v2-music.settings';

const ALBUM_SIZE = 64;
const DEFAULT_VOLUME = 1;
const PLAYER_BUTTON_WIDTH = 104;
const VOLUME_FADE_MS = 1500;

function getVinylTranslateX(revealPercent: number) {
  const fullyExtendedReveal = PLAYER_BUTTON_WIDTH - ALBUM_SIZE;
  const requestedReveal = ALBUM_SIZE * (revealPercent / 100);

  return requestedReveal - fullyExtendedReveal;
}

export default function V2MusicPlayer({
  autoplayDelayMs,
  contentOpacity,
  contentOpacityTransitionMs,
  fontClassName,
  isRevealed,
  revealStyle
}: {
  autoplayDelayMs: number;
  contentOpacity: number;
  contentOpacityTransitionMs: number;
  fontClassName: string;
  isRevealed: boolean;
  revealStyle: CSSProperties;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const cancelAutoplayRef = useRef<() => void>(() => undefined);
  const continuePlaybackRef = useRef(false);
  const metadataHideTimerRef = useRef<number | undefined>(undefined);
  const metadataRevealFrameRef = useRef<number | undefined>(undefined);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMetadataMounted, setIsMetadataMounted] = useState(false);
  const [isMetadataVisible, setIsMetadataVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<V2MusicPlayerSettings>(() => ({
    ...DEFAULT_V2_MUSIC_SETTINGS
  }));
  const currentTrack = v2MusicTracks[currentTrackIndex];
  const isMetadataExpanded = isMetadataVisible && isHovered;
  const metadataOpacity = !isMetadataVisible
    ? 0
    : isMetadataExpanded
    ? settings.hoverMetadataOpacity
    : settings.playingMetadataOpacity;
  const metadataScale = isMetadataExpanded
    ? settings.hoverMetadataScale
    : settings.playingMetadataScale;
  const metadataTranslateX = isMetadataVisible
    ? 0
    : -settings.metadataSlideDistance;
  const vinylReveal =
    isPlaying || isHovered
      ? settings.playingVinylReveal
      : settings.pausedVinylReveal;
  const isAlbumBorderVisible =
    settings.albumBorderVisibility === 'always' || isPlaying;

  const hideMetadata = useCallback(() => {
    if (metadataRevealFrameRef.current !== undefined) {
      window.cancelAnimationFrame(metadataRevealFrameRef.current);
    }

    window.clearTimeout(metadataHideTimerRef.current);
    setIsMetadataVisible(false);
    metadataHideTimerRef.current = window.setTimeout(() => {
      setIsMetadataMounted(false);
    }, settings.metadataTransitionMs);
  }, [settings.metadataTransitionMs]);

  const showMetadata = useCallback(() => {
    window.clearTimeout(metadataHideTimerRef.current);

    if (metadataRevealFrameRef.current !== undefined) {
      window.cancelAnimationFrame(metadataRevealFrameRef.current);
    }

    setIsMetadataMounted(true);
    metadataRevealFrameRef.current = window.requestAnimationFrame(() => {
      setIsMetadataVisible(true);
    });
  }, []);

  const playCurrentTrack = useCallback(
    async (showPlaybackError = true, initialVolume = DEFAULT_VOLUME) => {
      const audio = audioRef.current;

      if (!audio) {
        return false;
      }

      audio.volume = initialVolume;
      trackEvent(ANALYTICS_EVENTS.v2MusicPlaybackInitiated, {
        track_title: currentTrack.title
      });

      try {
        await audio.play();
        setHasPlaybackError(false);
        trackEvent(ANALYTICS_EVENTS.v2MusicPlaybackSuccess, {
          track_title: currentTrack.title
        });
        return true;
      } catch (error) {
        continuePlaybackRef.current = false;
        if (showPlaybackError) {
          setHasPlaybackError(true);
        }
        setIsPlaying(false);
        hideMetadata();
        trackEvent(ANALYTICS_EVENTS.v2MusicPlaybackFailure, {
          error_name: error instanceof Error ? error.name : 'PlaybackError',
          track_title: currentTrack.title
        });
        return false;
      }
    },
    [currentTrack.title, hideMetadata]
  );

  useEffect(() => {
    return () => {
      window.clearTimeout(metadataHideTimerRef.current);

      if (metadataRevealFrameRef.current !== undefined) {
        window.cancelAnimationFrame(metadataRevealFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    let fadeFrame: number | undefined;
    let isCancelled = false;

    if (!audio || !isRevealed || !IS_V2_MUSIC_AUTOPLAY_ENABLED) {
      return;
    }

    audio.volume = 0;

    const removeInteractionFallback = () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    const startPlaybackWithFade = async () => {
      continuePlaybackRef.current = true;
      const didStart = await playCurrentTrack(false, 0);

      if (!didStart || isCancelled) {
        return false;
      }

      removeInteractionFallback();
      const fadeStartedAt = window.performance.now();

      const fadeVolume = (now: number) => {
        const currentAudio = audioRef.current;

        if (!currentAudio || isCancelled) {
          return;
        }

        const progress = Math.max(
          0,
          Math.min((now - fadeStartedAt) / VOLUME_FADE_MS, 1)
        );
        currentAudio.volume = DEFAULT_VOLUME * progress;

        if (progress < 1 && !currentAudio.paused) {
          fadeFrame = window.requestAnimationFrame(fadeVolume);
        }
      };

      fadeFrame = window.requestAnimationFrame(fadeVolume);
      return true;
    };

    function handleFirstInteraction(event: Event) {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest('[data-v2-music-player]')
      ) {
        return;
      }

      void startPlaybackWithFade();
    }

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    const autoplayTimer = window.setTimeout(() => {
      if (!audio.paused) {
        return;
      }

      void startPlaybackWithFade();
    }, autoplayDelayMs);

    const cancelAutoplay = () => {
      isCancelled = true;
      window.clearTimeout(autoplayTimer);
      removeInteractionFallback();

      if (fadeFrame !== undefined) {
        window.cancelAnimationFrame(fadeFrame);
      }
    };

    cancelAutoplayRef.current = cancelAutoplay;

    return cancelAutoplay;
  }, [autoplayDelayMs, isRevealed, playCurrentTrack]);

  const updateSetting = useCallback(
    (key: keyof V2MusicPlayerSettings, value: number) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value
      }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_V2_MUSIC_SETTINGS });
  }, []);

  const updateBorderVisibility = useCallback(
    (albumBorderVisibility: V2AlbumBorderVisibility) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        albumBorderVisibility
      }));
    },
    []
  );

  function toggleAudio() {
    const audio = audioRef.current;

    cancelAutoplayRef.current();

    if (!audio) {
      return;
    }

    if (!audio.paused) {
      continuePlaybackRef.current = false;
      trackEvent(ANALYTICS_EVENTS.v2MusicControlUsed, {
        action: 'pause',
        track_title: currentTrack.title
      });
      audio.pause();
      return;
    }

    continuePlaybackRef.current = true;
    trackEvent(ANALYTICS_EVENTS.v2MusicControlUsed, {
      action: 'play',
      track_title: currentTrack.title
    });
    void playCurrentTrack();
  }

  function playNextTrack() {
    continuePlaybackRef.current = true;
    setIsPlaying(false);
    hideMetadata();
    setCurrentTrackIndex(
      (trackIndex) => (trackIndex + 1) % v2MusicTracks.length
    );
  }

  function resumePlaylist() {
    if (continuePlaybackRef.current && audioRef.current?.paused) {
      void playCurrentTrack();
    }
  }

  return (
    <>
      {IS_V2_MUSIC_DEV_PANEL_ENABLED ? (
        <V2MusicDevPanel
          settings={settings}
          onBorderVisibilityChange={updateBorderVisibility}
          onChange={updateSetting}
          onReset={resetSettings}
        />
      ) : null}

      <div
        data-v2-content-cursor='true'
        data-v2-hide-cursor='true'
        data-v2-music-player
        data-v2-spotlight-exclusion-zone='true'
        className={`v2-corner-item v2-music-player-shell v2-spotlight-exclusion-zone v2-spotlight-exclusion-music absolute bottom-2.5 left-2.5 origin-bottom-left cursor-pointer motion-reduce:transition-none sm:bottom-4.5 sm:left-4.5 lg:bottom-6 lg:left-6 ${
          isRevealed ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={revealStyle}
        onClick={(event) => {
          const target = event.target;

          if (target instanceof Element && target.closest('button')) {
            return;
          }

          toggleAudio();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span
          aria-hidden='true'
          className='v2-music-zone-hit-target'
        />
        <div
          className='v2-corner-visual relative z-10 flex items-center'
          style={{
            opacity: contentOpacity,
            transform: `scale(${settings.componentScale})`,
            transformOrigin: 'bottom left',
            transition: `opacity ${contentOpacityTransitionMs}ms ease-out, transform ${settings.metadataTransitionMs}ms ease-out`
          }}
        >
          <audio
            ref={audioRef}
            preload='metadata'
            src={currentTrack.audioSrc}
            onCanPlay={resumePlaylist}
            onEnded={playNextTrack}
            onError={() => {
              continuePlaybackRef.current = false;
              setHasPlaybackError(true);
              setIsPlaying(false);
              hideMetadata();
              trackEvent(ANALYTICS_EVENTS.v2MusicMediaFailed, {
                media_error_code: audioRef.current?.error?.code ?? null,
                track_title: currentTrack.title
              });
            }}
            onPause={() => {
              setIsPlaying(false);
              hideMetadata();
            }}
            onPlay={() => {
              setIsPlaying(true);
              showMetadata();
            }}
          />

          <button
            aria-label={`${isPlaying ? 'Pause' : 'Play'} ${currentTrack.title}`}
            aria-pressed={isPlaying}
            data-v2-content-cursor='true'
            data-v2-hide-cursor='true'
            className='v2-expanded-hit-target relative h-16 w-[104px] shrink-0 cursor-pointer focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-400'
            type='button'
            onClick={toggleAudio}
          >
            <span
              aria-hidden='true'
              data-v2-hide-cursor='true'
              data-v2-music-hit-target='true'
              className='v2-vinyl-slide absolute top-1/2 right-0 z-10 size-16 cursor-pointer rounded-full'
              style={{
                transform: `translate(${getVinylTranslateX(
                  vinylReveal
                )}px, -50%)`,
                transitionDelay: isPlaying
                  ? `${settings.vinylSlideDelayMs}ms`
                  : '0ms',
                transitionDuration: `${settings.vinylSlideMs}ms`
              }}
            >
              <span
                className='v2-vinyl-disc absolute inset-0 cursor-pointer rounded-full'
                style={{
                  animation: `v2-vinyl-spin ${settings.rotationSeconds}s linear infinite`,
                  animationPlayState: isPlaying ? 'running' : 'paused',
                  background:
                    'repeating-radial-gradient(circle, transparent 0 3px, rgba(255,255,255,0.08) 3px 4px), conic-gradient(from 20deg, #09090b, #27272a 18%, #09090b 36%, #3f3f46 52%, #09090b 70%, #27272a 88%, #09090b)'
                }}
              >
                <span className='absolute inset-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500' />
                <span className='absolute inset-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950' />
              </span>
            </span>

            <span
              data-v2-hide-cursor='true'
              data-v2-music-hit-target='true'
              className='absolute top-1/2 left-0 z-20 flex size-16 -translate-y-1/2 cursor-pointer items-end overflow-hidden bg-zinc-950 text-left'
              style={{
                borderColor: isAlbumBorderVisible
                  ? 'rgba(255,255,255,0.9)'
                  : 'transparent',
                borderRadius: `${settings.albumRadius}px`,
                borderStyle: 'solid',
                borderWidth: `${settings.albumBorderWidth}px`,
                transition: `border-color ${settings.albumBorderTransitionMs}ms ease-out`
              }}
            >
              <Image
                fill
                priority={currentTrackIndex === 0}
                alt=''
                aria-hidden='true'
                className='object-cover'
                sizes='64px'
                src={currentTrack.albumArtSrc}
              />
            </span>
          </button>

          {isMetadataMounted ? (
            <div
              className={`${fontClassName} v2-music-metadata relative z-0 ml-3 flex max-w-[min(18rem,calc(100vw-9rem))] min-w-0 origin-left flex-col sm:ml-4`}
              style={{
                gap: `${settings.metadataGap}px`,
                opacity: metadataOpacity,
                pointerEvents: 'none',
                transform: `translateX(${metadataTranslateX}px) scale(${metadataScale})`,
                transition: `opacity ${settings.metadataTransitionMs}ms ease-out, transform ${settings.metadataTransitionMs}ms ease-out`
              }}
            >
              <span
                className='block truncate text-base leading-none text-zinc-100 sm:text-lg'
                style={{ fontWeight: settings.songWeight }}
              >
                {currentTrack.title}
              </span>
              <span
                className='block truncate text-[11px] leading-none text-zinc-300 sm:text-xs'
                style={{ fontWeight: settings.artistWeight }}
              >
                {currentTrack.artist}
              </span>
              {hasPlaybackError ? (
                <span className='block text-[10px] leading-none text-red-300'>
                  Audio unavailable
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
