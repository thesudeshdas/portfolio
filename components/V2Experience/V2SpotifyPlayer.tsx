'use client';

import Image from 'next/image';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

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
    isPaused?: boolean;
  };
}

interface SpotifyEmbedController {
  addListener(
    event: 'playback_started' | 'playback_update' | 'ready',
    listener: (event: SpotifyPlaybackEvent) => void
  ): void;
  destroy(): void;
  togglePlay(): void;
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

export default function V2SpotifyPlayer() {
  const embedTargetRef = useRef<HTMLDivElement>(null);
  const embedControllerRef = useRef<SpotifyEmbedController | null>(null);
  const [spotify, setSpotify] = useState<SpotifyNowPlayingResponse | null>(
    null
  );
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [shouldLoadScript, setShouldLoadScript] = useState(false);

  const track = spotify?.track;
  const title = track?.title ?? FALLBACK_TITLE;
  const artist = track?.artists.join(', ') ?? FALLBACK_ARTIST;
  const artworkUrl = track?.albumImageUrl || '/gojo-compressed.png';
  const spotifyEntityUri = track?.spotifyUri
    ? track.spotifyUri
    : spotify?.defaultPlaylistId
    ? `spotify:playlist:${spotify.defaultPlaylistId}`
    : '';

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
          controller.addListener('playback_started', () => setIsMuted(false));
          controller.addListener('playback_update', (event) => {
            if (typeof event.data.isPaused === 'boolean') {
              setIsMuted(event.data.isPaused);
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
      delete window.onSpotifyIframeApiReady;
    };
  }, [spotifyEntityUri]);

  function toggleSpotifyAudio() {
    if (!isPlayerReady) {
      return;
    }

    embedControllerRef.current?.togglePlay();
  }

  return (
    <div className='group absolute bottom-2.5 left-2.5 flex items-center sm:bottom-4.5 sm:left-4.5 lg:bottom-6 lg:left-6'>
      {shouldLoadScript ? (
        <Script src='https://open.spotify.com/embed/iframe-api/v1' />
      ) : null}

      <div
        ref={embedTargetRef}
        aria-hidden='true'
        className='pointer-events-none absolute size-px overflow-hidden opacity-0'
      />

      <button
        aria-label={isMuted ? 'Unmute Spotify' : 'Mute Spotify'}
        aria-pressed={!isMuted}
        aria-disabled={!isPlayerReady}
        className='relative h-16 w-[104px] shrink-0 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-400'
        title={isMuted ? 'Unmute Spotify' : 'Mute Spotify'}
        type='button'
        onClick={toggleSpotifyAudio}
      >
        <span
          aria-hidden='true'
          className={`absolute top-1/2 right-0 size-16 -translate-y-1/2 rounded-full motion-reduce:animate-none ${
            isMuted ? '' : 'animate-[spin_6s_linear_infinite]'
          }`}
          style={{
            background:
              'repeating-radial-gradient(circle, transparent 0 3px, rgba(255,255,255,0.08) 3px 4px), conic-gradient(from 20deg, #09090b, #27272a 18%, #09090b 36%, #3f3f46 52%, #09090b 70%, #27272a 88%, #09090b)'
          }}
        >
          <span className='absolute inset-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500' />
          <span className='absolute inset-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-950' />
        </span>

        <span className='absolute top-1/2 left-0 size-16 -translate-y-1/2 overflow-hidden rounded-sm'>
          <Image
            fill
            alt={`${title} artwork`}
            className='object-cover'
            sizes='64px'
            src={artworkUrl}
          />
        </span>
      </button>

      <div className='pointer-events-none ml-3 max-w-[min(18rem,calc(100vw-9rem))] min-w-0 translate-x-2 opacity-0 transition-[opacity,transform] duration-200 ease-out group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 sm:ml-4'>
        <p className='truncate text-base leading-tight font-semibold text-zinc-100 sm:text-lg'>
          {title}
        </p>
        <p className='mt-1 truncate text-[11px] leading-tight font-light text-zinc-400 sm:text-xs'>
          {artist}
        </p>
      </div>
    </div>
  );
}
