# Spotify Now Playing

The server endpoint at `GET /api/spotify/now-playing` reads the portfolio
owner's current Spotify playback. It never sends Spotify credentials or access
tokens to the browser.

## Spotify developer setup

1. Create an app in the
   [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add this redirect URI exactly:
   `http://127.0.0.1:3003/api/spotify/callback`.
   Spotify permits HTTP for loopback IP addresses during local development;
   use `127.0.0.1`, not `localhost`.
3. Request only the `user-read-currently-playing` authorization scope.
4. Copy the app's client ID and client secret into your shell environment.
5. Run the one-time helper:

   ```bash
   export SPOTIFY_CLIENT_ID='your-client-id'
   export SPOTIFY_CLIENT_SECRET='your-client-secret'
   pnpm spotify:auth
   ```

6. Open the printed authorization URL, approve access, then paste the complete
   redirected URL back into the helper. The redirect can show a 404; the code
   remains in the browser address bar.
7. Copy the printed refresh token into `SPOTIFY_REFRESH_TOKEN`. The helper
   prints the token once and never saves credentials or tokens.

Spotify refresh tokens currently expire after six months. Repeat the one-time
authorization flow when the token expires or is revoked. See Spotify's official
[authorization code](https://developer.spotify.com/documentation/web-api/tutorials/code-flow),
[refresh token](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens),
and [scope](https://developer.spotify.com/documentation/web-api/concepts/scopes)
documentation.

## Environment variables

Add these values to `.env.local` for local development and to the Vercel
project's environment variables for Preview and Production:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
SPOTIFY_DEFAULT_PLAYLIST_ID=your_default_playlist_id
```

The default playlist ID is the ID portion of a Spotify playlist URL, not the
complete URL.

## Endpoint contract

Successful track playback returns:

```json
{
  "isPlaying": true,
  "track": {
    "title": "Track title",
    "artists": ["Artist"],
    "album": "Album title",
    "albumImageUrl": "https://i.scdn.co/image/...",
    "spotifyUrl": "https://open.spotify.com/track/...",
    "spotifyUri": "spotify:track:...",
    "progressMs": 0,
    "durationMs": 0
  },
  "defaultPlaylistId": "...",
  "status": "playing"
}
```

All inactive and recoverable failure states return HTTP 200 with `track: null`,
`isPlaying: false`, the configured default playlist ID, and one status:

- `paused`
- `idle`
- `unsupported`
- `unconfigured`
- `auth_error`
- `rate_limited`
- `upstream_error`

Podcast episodes and unknown Spotify item types use `unsupported`. Rate-limited
responses include a safe `Retry-After` header when Spotify supplies one. The
response is cached on Vercel's CDN for 20 seconds with stale revalidation.

## Local verification

```bash
pnpm dev
curl -i http://localhost:3003/api/spotify/now-playing
```

With no Spotify environment variables, the endpoint should return an inactive
response with `status: "unconfigured"`. After configuration, start or pause a
Spotify track and call the endpoint again after the 20-second cache window.
