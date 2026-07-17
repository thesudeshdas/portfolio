import 'server-only';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_CURRENTLY_PLAYING_URL =
  'https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode';
const REQUEST_TIMEOUT_MS = 6000;
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 60_000;

export type SpotifyNowPlayingStatus =
  | 'playing'
  | 'paused'
  | 'idle'
  | 'unsupported'
  | 'unconfigured'
  | 'auth_error'
  | 'rate_limited'
  | 'upstream_error';

export interface SpotifyTrack {
  title: string;
  artists: string[];
  album: string;
  albumImageUrl: string;
  spotifyUrl: string;
  spotifyUri: string;
  progressMs: number;
  durationMs: number;
}

export interface SpotifyNowPlayingResponse {
  isPlaying: boolean;
  track: SpotifyTrack | null;
  defaultPlaylistId: string;
  status: SpotifyNowPlayingStatus;
}

interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  defaultPlaylistId: string;
}

interface SpotifyNowPlayingResult {
  data: SpotifyNowPlayingResponse;
  retryAfterSeconds?: number;
}

interface CachedAccessToken {
  value: string;
  expiresAt: number;
}

type AccessTokenResult =
  | { token: string }
  | {
      status: Extract<
        SpotifyNowPlayingStatus,
        'auth_error' | 'rate_limited' | 'upstream_error'
      >;
      retryAfterSeconds?: number;
    };

let cachedAccessToken: CachedAccessToken | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNonNegativeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function getRetryAfterSeconds(response: Response): number | undefined {
  const retryAfter = Number(response.headers.get('retry-after'));

  return Number.isFinite(retryAfter) && retryAfter > 0
    ? Math.ceil(retryAfter)
    : undefined;
}

function createFallback(
  status: Exclude<SpotifyNowPlayingStatus, 'playing'>,
  defaultPlaylistId: string
): SpotifyNowPlayingResponse {
  return {
    isPlaying: false,
    track: null,
    defaultPlaylistId,
    status
  };
}

function getSpotifyConfig(): SpotifyConfig | null {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim() ?? '';
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim() ?? '';
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim() ?? '';
  const defaultPlaylistId =
    process.env.SPOTIFY_DEFAULT_PLAYLIST_ID?.trim() ?? '';

  if (!clientId || !clientSecret || !refreshToken || !defaultPlaylistId) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
    defaultPlaylistId
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      cache: 'no-store',
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshAccessToken(
  config: SpotifyConfig
): Promise<AccessTokenResult> {
  let response: Response;

  try {
    response = await fetchWithTimeout(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${config.clientId}:${config.clientSecret}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: config.refreshToken
      })
    });
  } catch {
    return { status: 'upstream_error' };
  }

  if (response.status === 429) {
    return {
      status: 'rate_limited',
      retryAfterSeconds: getRetryAfterSeconds(response)
    };
  }

  if (!response.ok) {
    return {
      status:
        response.status === 400 || response.status === 401
          ? 'auth_error'
          : 'upstream_error'
    };
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return { status: 'upstream_error' };
  }

  if (!isRecord(payload) || typeof payload.access_token !== 'string') {
    return { status: 'upstream_error' };
  }

  const expiresInSeconds =
    typeof payload.expires_in === 'number' ? payload.expires_in : 3600;
  const expiresAt =
    Date.now() +
    Math.max(0, expiresInSeconds * 1000 - ACCESS_TOKEN_EXPIRY_BUFFER_MS);

  cachedAccessToken = {
    value: payload.access_token,
    expiresAt
  };

  return { token: payload.access_token };
}

async function getAccessToken(
  config: SpotifyConfig
): Promise<AccessTokenResult> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return { token: cachedAccessToken.value };
  }

  cachedAccessToken = null;
  return refreshAccessToken(config);
}

async function requestCurrentlyPlaying(
  accessToken: string
): Promise<Response | null> {
  try {
    return await fetchWithTimeout(SPOTIFY_CURRENTLY_PLAYING_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  } catch {
    return null;
  }
}

function readArtists(item: Record<string, unknown>): string[] {
  if (!Array.isArray(item.artists)) {
    return [];
  }

  return item.artists.flatMap((artist) => {
    if (!isRecord(artist) || typeof artist.name !== 'string') {
      return [];
    }

    return [artist.name];
  });
}

function readAlbumImageUrl(album: Record<string, unknown>): string {
  if (!Array.isArray(album.images)) {
    return '';
  }

  for (const image of album.images) {
    if (isRecord(image) && typeof image.url === 'string') {
      return image.url;
    }
  }

  return '';
}

function parseTrack(
  item: Record<string, unknown>,
  payload: Record<string, unknown>
): SpotifyTrack | null {
  if (item.type !== 'track' || !isRecord(item.album)) {
    return null;
  }

  const title = readString(item.name);
  const spotifyUri = readString(item.uri);
  const artists = readArtists(item);
  const externalUrls = isRecord(item.external_urls) ? item.external_urls : {};

  if (!title || !spotifyUri || artists.length === 0) {
    return null;
  }

  return {
    title,
    artists,
    album: readString(item.album.name),
    albumImageUrl: readAlbumImageUrl(item.album),
    spotifyUrl: readString(externalUrls.spotify),
    spotifyUri,
    progressMs: readNonNegativeNumber(payload.progress_ms),
    durationMs: readNonNegativeNumber(item.duration_ms)
  };
}

async function parseCurrentlyPlayingResponse(
  response: Response,
  defaultPlaylistId: string
): Promise<SpotifyNowPlayingResult> {
  if (response.status === 204) {
    return { data: createFallback('idle', defaultPlaylistId) };
  }

  if (response.status === 429) {
    return {
      data: createFallback('rate_limited', defaultPlaylistId),
      retryAfterSeconds: getRetryAfterSeconds(response)
    };
  }

  if (response.status === 401 || response.status === 403) {
    return { data: createFallback('auth_error', defaultPlaylistId) };
  }

  if (!response.ok) {
    return { data: createFallback('upstream_error', defaultPlaylistId) };
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return { data: createFallback('upstream_error', defaultPlaylistId) };
  }

  if (!isRecord(payload) || !isRecord(payload.item)) {
    return { data: createFallback('idle', defaultPlaylistId) };
  }

  if (payload.item.type !== 'track') {
    return { data: createFallback('unsupported', defaultPlaylistId) };
  }

  if (payload.is_playing !== true) {
    return { data: createFallback('paused', defaultPlaylistId) };
  }

  const track = parseTrack(payload.item, payload);

  if (!track) {
    return { data: createFallback('unsupported', defaultPlaylistId) };
  }

  return {
    data: {
      isPlaying: true,
      track,
      defaultPlaylistId,
      status: 'playing'
    }
  };
}

export async function getSpotifyNowPlaying(): Promise<SpotifyNowPlayingResult> {
  const config = getSpotifyConfig();
  const defaultPlaylistId =
    process.env.SPOTIFY_DEFAULT_PLAYLIST_ID?.trim() ?? '';

  if (!config) {
    return { data: createFallback('unconfigured', defaultPlaylistId) };
  }

  let accessTokenResult = await getAccessToken(config);

  if (!('token' in accessTokenResult)) {
    return {
      data: createFallback(accessTokenResult.status, config.defaultPlaylistId),
      retryAfterSeconds: accessTokenResult.retryAfterSeconds
    };
  }

  let response = await requestCurrentlyPlaying(accessTokenResult.token);

  if (!response) {
    return {
      data: createFallback('upstream_error', config.defaultPlaylistId)
    };
  }

  if (response.status === 401) {
    cachedAccessToken = null;
    accessTokenResult = await getAccessToken(config);

    if (!('token' in accessTokenResult)) {
      return {
        data: createFallback(
          accessTokenResult.status,
          config.defaultPlaylistId
        ),
        retryAfterSeconds: accessTokenResult.retryAfterSeconds
      };
    }

    response = await requestCurrentlyPlaying(accessTokenResult.token);

    if (!response) {
      return {
        data: createFallback('upstream_error', config.defaultPlaylistId)
      };
    }
  }

  return parseCurrentlyPlayingResponse(response, config.defaultPlaylistId);
}
