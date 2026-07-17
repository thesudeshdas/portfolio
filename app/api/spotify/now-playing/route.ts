import { getSpotifyNowPlaying } from '@/lib/spotify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CACHE_CONTROL = 'public, max-age=0, must-revalidate';
const VERCEL_CACHE_CONTROL = 'public, s-maxage=20, stale-while-revalidate=40';

export async function GET() {
  const result = await getSpotifyNowPlaying();
  const headers = new Headers({
    'Cache-Control': CACHE_CONTROL,
    'Vercel-CDN-Cache-Control': VERCEL_CACHE_CONTROL
  });

  if (result.retryAfterSeconds) {
    headers.set('Retry-After', String(result.retryAfterSeconds));
  }

  return Response.json(result.data, {
    status: 200,
    headers
  });
}
