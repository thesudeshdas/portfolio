'use client';

import Image from 'next/image';
import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SpotifyTrack {
  title: string;
  artists: string[];
  albumImageUrl: string;
  spotifyUri: string;
}

interface SpotifyNowPlayingResponse {
  track: SpotifyTrack | null;
  defaultPlaylistId: string;
}

interface SpotifyPlaybackEvent {
  data: {
    duration?: number;
    isPaused?: boolean;
    position?: number;
  };
}

interface SpotifyEmbedController {
  addListener(
    event: 'playback_started' | 'playback_update' | 'ready',
    listener: (event: SpotifyPlaybackEvent) => void
  ): void;
  destroy(): void;
  pause(): void;
  play(): void;
}

interface SpotifyIFrameApi {
  createController(
    element: HTMLElement,
    options: {
      height: number;
      uri: string;
      width: number;
    },
    callback: (controller: SpotifyEmbedController) => void
  ): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void;
    spotifyIframeApi?: SpotifyIFrameApi;
  }
}

const FALLBACK_TITLE = 'Serene Five';
const FALLBACK_ARTIST = 'Dash';
const PLAYBACK_WATCHDOG_MS = 3000;

export default function V2SpotifyPlayer() {
  const embedTargetRef = useRef<HTMLDivElement>(null);
  const embedControllerRef = useRef<SpotifyEmbedController | null>(null);
  const playbackWatchdogRef = useRef<number | null>(null);
  const [spotify, setSpotify] = useState<SpotifyNowPlayingResponse | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [hasActivatedPlayer, setHasActivatedPlayer] = useState(false);
  const [shouldLoadScript, setShouldLoadScript] = useState(false);

  const track = spotify?.track;
  const title = track?.title ?? FALLBACK_TITLE;
  const artist = track?.artists.join(', ') ?? FALLBACK_ARTIST;
  const artworkUrl = track?.albumImageUrl ?? '';
  const spotifyEntityUri = track?.spotifyUri
    ? track.spotifyUri
    : spotify?.defaultPlaylistId
    ? `spotify:playlist:${spotify.defaultPlaylistId}`
    : '';

  const stopPlaybackTracking = useCallback(() => {
    if (playbackWatchdogRef.current !== null) {
      window.clearTimeout(playbackWatchdogRef.current);
      playbackWatchdogRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  const markPlaybackActive = useCallback(() => {
    if (playbackWatchdogRef.current !== null) {
      window.clearTimeout(playbackWatchdogRef.current);
    }

    setIsPlaying(true);
    playbackWatchdogRef.current = window.setTimeout(() => {
      playbackWatchdogRef.current = null;
      setIsPlaying(false);
    }, PLAYBACK_WATCHDOG_MS);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadNowPlaying() {
      try {
        const response = await fetch('/api/spotify/now-playing', {
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as SpotifyNowPlayingResponse;
        setSpotify(payload);
      } catch {
        return;
      }
    }

    void loadNowPlaying();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!spotifyEntityUri) {
      return;
    }

    let disposed = false;

    function createController(api: SpotifyIFrameApi) {
      if (!embedTargetRef.current || embedControllerRef.current) {
        return;
      }

      api.createController(
        embedTargetRef.current,
        {
          height: 152,
          uri: spotifyEntityUri,
          width: 352
        },
        (controller) => {
          if (disposed) {
            controller.destroy();
            return;
          }

          embedControllerRef.current = controller;
          controller.addListener('ready', () => setIsPlayerReady(true));
          controller.addListener('playback_started', () => {
            setHasActivatedPlayer(true);
            markPlaybackActive();
          });
          controller.addListener('playback_update', (event) => {
            const { duration, isPaused, position } = event.data;
            const hasEnded =
              typeof duration === 'number' &&
              duration > 0 &&
              typeof position === 'number' &&
              position >= duration - 250;

            if (isPaused === true || hasEnded) {
              stopPlaybackTracking();
              return;
            }

            if (isPaused === false) {
              markPlaybackActive();
            }
          });
        }
      );
    }

    window.onSpotifyIframeApiReady = (api) => {
      window.spotifyIframeApi = api;
      createController(api);
    };

    if (window.spotifyIframeApi) {
      createController(window.spotifyIframeApi);
    }

    setShouldLoadScript(true);

    return () => {
      disposed = true;
      embedControllerRef.current?.destroy();
      embedControllerRef.current = null;
      if (playbackWatchdogRef.current !== null) {
        window.clearTimeout(playbackWatchdogRef.current);
        playbackWatchdogRef.current = null;
      }
      delete window.onSpotifyIframeApiReady;
    };
  }, [markPlaybackActive, spotifyEntityUri, stopPlaybackTracking]);

  function toggleSpotifyAudio() {
    if (!isPlayerReady) {
      return;
    }

    if (!isPlaying) {
      markPlaybackActive();
      embedControllerRef.current?.play();
      return;
    }

    stopPlaybackTracking();
    embedControllerRef.current?.pause();
  }

  return (
    <div className='group absolute bottom-2.5 left-2.5 flex items-center sm:bottom-4.5 sm:left-4.5 lg:bottom-6 lg:left-6'>
      {shouldLoadScript ? (
        <Script src='https://open.spotify.com/embed/iframe-api/v1' />
      ) : null}

      <div
        aria-hidden='true'
        className={`v2-spotify-hit-target absolute top-1/2 left-0 z-20 h-16 w-[104px] -translate-y-1/2 cursor-pointer overflow-hidden opacity-0 [&_iframe]:absolute [&_iframe]:top-[-464px] [&_iframe]:left-[-1236px] [&_iframe]:origin-top-left [&_iframe]:scale-[4] ${
          hasActivatedPlayer ? 'pointer-events-none' : ''
        }`}
      >
        <div ref={embedTargetRef} />
      </div>

      <button
        aria-label={isPlaying ? 'Mute Spotify' : 'Unmute Spotify'}
        aria-pressed={isPlaying}
        aria-disabled={!isPlayerReady}
        className='relative h-16 w-[104px] shrink-0 cursor-pointer focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-400'
        title={isPlaying ? 'Mute Spotify' : 'Unmute Spotify'}
        type='button'
        onClick={toggleSpotifyAudio}
      >
        <span
          aria-hidden='true'
          className={`absolute top-1/2 right-0 size-16 -translate-y-1/2 rounded-full motion-reduce:animate-none ${
            isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
          }`}
          style={{
            background:
              'repeating-radial-gradient(circle, transparent 0 3px, rgba(255,255,255,0.08) 3px 4px), conic-gradient(from 20deg, #09090b, #27272a 18%, #09090b 36%, #3f3f46 52%, #09090b 70%, #27272a 88%, #09090b)'
          }}
        >
          <span className='absolute inset-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500' />
          <span className='absolute inset-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950' />
        </span>

        <span className='absolute top-1/2 left-0 size-16 -translate-y-1/2 overflow-hidden rounded-sm bg-zinc-900'>
          {artworkUrl ? (
            <Image
              fill
              alt=''
              className='object-cover'
              sizes='64px'
              src={artworkUrl}
            />
          ) : null}
        </span>
      </button>

      <div className='pointer-events-none ml-3 max-w-[min(18rem,calc(100vw-9rem))] min-w-0 translate-x-2 opacity-0 transition-[opacity,transform] duration-200 ease-out group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 sm:ml-4'>
        <span className='block truncate text-base leading-tight font-semibold text-zinc-100 sm:text-lg'>
          {title}
        </span>
        <span className='mt-1 block truncate text-[11px] leading-tight font-light text-zinc-300 sm:text-xs'>
          {artist}
        </span>
      </div>
    </div>
  );
}
