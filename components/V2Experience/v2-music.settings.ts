export type V2AlbumBorderVisibility = 'always' | 'playing';

export interface V2MusicPlayerSettings {
  albumBorderTransitionMs: number;
  albumBorderVisibility: V2AlbumBorderVisibility;
  albumBorderWidth: number;
  albumRadius: number;
  artistWeight: number;
  componentScale: number;
  hoverMetadataOpacity: number;
  hoverMetadataScale: number;
  metadataGap: number;
  metadataSlideDistance: number;
  metadataTransitionMs: number;
  pausedVinylReveal: number;
  playingMetadataOpacity: number;
  playingMetadataScale: number;
  playingVinylReveal: number;
  rotationSeconds: number;
  songWeight: number;
  vinylSlideDelayMs: number;
  vinylSlideMs: number;
}

export const DEFAULT_V2_MUSIC_SETTINGS: V2MusicPlayerSettings = {
  albumBorderTransitionMs: 400,
  albumBorderVisibility: 'playing',
  albumBorderWidth: 4,
  albumRadius: 8,
  artistWeight: 400,
  componentScale: 0.6,
  hoverMetadataOpacity: 1,
  hoverMetadataScale: 1,
  metadataGap: 0,
  metadataSlideDistance: 32,
  metadataTransitionMs: 400,
  pausedVinylReveal: 25,
  playingMetadataOpacity: 0.55,
  playingMetadataScale: 0.9,
  playingVinylReveal: 62.5,
  rotationSeconds: 6,
  songWeight: 700,
  vinylSlideDelayMs: 0,
  vinylSlideMs: 1000
};

export const IS_V2_MUSIC_DEV_PANEL_ENABLED =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_V2_MUSIC_DEV_PANEL === 'true';
