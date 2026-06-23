# Ideas

- Add a small corner section on one edge of the screen titled “small corner for me in the digital world”.
- Add an onboarding hint that tells users: move the cursor around for interactive mode, or keep scrolling for story mode.
- Show childhood photo from Jorhat with eyes redacted for family privacy, animated with a shimmer effect.
- V2 globe story stages: first stage is the loading text; second stage is the globe appearing, rotating, and zooming into India; third stage is India changing colors.
- Explore a public photo-gallery flow where Google Photos is only the private curation/source layer, not the public viewer. Selected images should sync into public storage such as S3, Cloudflare R2, Supabase Storage, or Vercel Blob, then render through a custom gallery page.
- Keep comments and likes inside the custom app instead of relying on Google Photos shared-album reactions. Public viewers can see comments and aggregate counts, but should not see who else liked or commented. Support anonymous or pseudonymous comments, moderation, and optional rate limits.
- Fetch gallery images lazily instead of loading the full album at once. Use paginated API calls such as `limit=24&cursor=...`, lazy image loading, responsive thumbnails, and full-resolution image fetch only when a visitor opens a photo.
- Avoid treating Google Photos URLs as permanent public image URLs. Google Photos media URLs are temporary, and API access is constrained, so long-lived public albums need an app-owned storage/cache layer.
