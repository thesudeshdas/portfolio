'use client';

import { useCallback, useRef, useState } from 'react';

import { v2MusicTracks } from './v2-music.data';

const DEFAULT_VOLUME = 0.35;

export default function V2MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const continuePlaybackRef = useRef(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTrack = v2MusicTracks[currentTrackIndex];

  const playCurrentTrack = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = DEFAULT_VOLUME;

    try {
      await audio.play();
      setHasPlaybackError(false);
    } catch {
      continuePlaybackRef.current = false;
      setHasPlaybackError(true);
      setIsPlaying(false);
    }
  }, []);

  function toggleAudio() {
    const audio = audioRef.current;

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
    <div className='group absolute bottom-2.5 left-2.5 flex items-center sm:bottom-4.5 sm:left-4.5 lg:bottom-6 lg:left-6'>
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
        title={`${isPlaying ? 'Pause' : 'Play'} ${currentTrack.title}`}
        type='button'
        onClick={toggleAudio}
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

        <span className='absolute top-1/2 left-0 flex size-16 -translate-y-1/2 items-end overflow-hidden rounded-sm bg-[radial-gradient(circle_at_25%_20%,#52525b_0%,#18181b_44%,#09090b_100%)] p-2 text-left'>
          <span
            aria-hidden='true'
            className='text-[10px] leading-none font-medium tracking-[0.16em] text-zinc-400 uppercase'
          >
            {String(currentTrackIndex + 1).padStart(2, '0')} / 05
          </span>
        </span>
      </button>

      <div className='ml-3 max-w-[min(18rem,calc(100vw-9rem))] min-w-0 translate-x-2 opacity-0 transition-[opacity,transform] duration-200 ease-out group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 sm:ml-4'>
        <a
          className='block truncate text-base leading-tight font-semibold text-zinc-100 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none sm:text-lg'
          href={currentTrack.sourceUrl}
          rel='noopener noreferrer'
          target='_blank'
          title={`Open ${currentTrack.title} on Free Music Archive`}
        >
          {currentTrack.title}
        </a>
        <a
          className='mt-1 block truncate text-[11px] leading-tight font-light text-zinc-300 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none sm:text-xs'
          href={currentTrack.artistUrl}
          rel='noopener noreferrer'
          target='_blank'
          title={`Open ${currentTrack.artist} on Free Music Archive`}
        >
          {currentTrack.artist}
        </a>
        {hasPlaybackError ? (
          <span className='mt-1 block text-[10px] leading-tight text-red-300'>
            Audio unavailable
          </span>
        ) : null}
      </div>
    </div>
  );
}
