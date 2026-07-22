'use client';

import Image from 'next/image';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import V2MusicDevPanel from './V2MusicDevPanel';
import { v2MusicTracks } from './v2-music.data';
import {
  DEFAULT_V2_MUSIC_SETTINGS,
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
  fontClassName,
  isRevealed,
  revealStyle
}: {
  autoplayDelayMs: number;
  fontClassName: string;
  isRevealed: boolean;
  revealStyle: CSSProperties;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const cancelAutoplayRef = useRef<() => void>(() => undefined);
  const continuePlaybackRef = useRef(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<V2MusicPlayerSettings>(() => ({
    ...DEFAULT_V2_MUSIC_SETTINGS
  }));
  const currentTrack = v2MusicTracks[currentTrackIndex];
  const isMetadataExpanded = isPlaying && isHovered;
  const metadataOpacity = !isPlaying
    ? 0
    : isMetadataExpanded
    ? settings.hoverMetadataOpacity
    : settings.playingMetadataOpacity;
  const metadataScale = isMetadataExpanded
    ? settings.hoverMetadataScale
    : settings.playingMetadataScale;
  const metadataTranslateX = isPlaying ? 0 : -settings.metadataSlideDistance;
  const vinylReveal =
    isPlaying || isHovered
      ? settings.playingVinylReveal
      : settings.pausedVinylReveal;
  const isAlbumBorderVisible =
    settings.albumBorderVisibility === 'always' || isPlaying;

  const playCurrentTrack = useCallback(
    async (showPlaybackError = true, initialVolume = DEFAULT_VOLUME) => {
      const audio = audioRef.current;

      if (!audio) {
        return false;
      }

      audio.volume = initialVolume;

      try {
        await audio.play();
        setHasPlaybackError(false);
        return true;
      } catch {
        continuePlaybackRef.current = false;
        if (showPlaybackError) {
          setHasPlaybackError(true);
        }
        setIsPlaying(false);
        return false;
      }
    },
    []
  );

  useEffect(() => {
    const audio = audioRef.current;
    let fadeFrame: number | undefined;
    let isCancelled = false;

    if (!audio || !isRevealed) {
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
      audio.pause();
      return;
    }

    continuePlaybackRef.current = true;
    void playCurrentTrack();
  }

  function playNextTrack() {
    continuePlaybackRef.current = true;
    setIsPlaying(false);
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
        data-v2-music-player
        className={`v2-corner-item v2-music-player-shell absolute bottom-2.5 left-2.5 origin-bottom-left motion-reduce:transition-none sm:bottom-4.5 sm:left-4.5 lg:bottom-6 lg:left-6 ${
          isRevealed ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={revealStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className='flex items-center'
          style={{
            transform: `scale(${settings.componentScale})`,
            transformOrigin: 'bottom left',
            transition: `transform ${settings.metadataTransitionMs}ms ease-out`
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
            }}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />

          <button
            aria-label={`${isPlaying ? 'Pause' : 'Play'} ${currentTrack.title}`}
            aria-pressed={isPlaying}
            className='relative h-16 w-[104px] shrink-0 cursor-pointer focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-400'
            type='button'
            onClick={toggleAudio}
          >
            <span
              aria-hidden='true'
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

          <div
            className={`${fontClassName} v2-music-metadata relative z-0 ml-3 max-w-[min(18rem,calc(100vw-9rem))] min-w-0 origin-left sm:ml-4`}
            style={{
              display: 'flex',
              flexDirection: 'column',
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
        </div>
      </div>
    </>
  );
}
