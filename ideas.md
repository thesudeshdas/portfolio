# Ideas

- Add a small corner section on one edge of the screen titled “small corner for me in the digital world”.
- Add an onboarding hint that tells users: move the cursor around for interactive mode, or keep scrolling for story mode.
- At the V2 start, offer two choices: “Story mode” with supporting copy “I want to see this as a story”, and “Interactive mode” with supporting copy “I want to explore myself”. If the user clicks, treat that as interactive mode, tell them their choice, and move ahead. If the user scrolls, treat that as story mode, tell them their choice, and move forward.
- In V2 story mode, continuous scrolling should progress through the full story from the user’s current point. If the user wants to interact at any time, mouse movement, hover, and clicks should switch into interactive behavior without resetting story progress; scrolling should resume from where they left off.
- In V2 interactive mode, reveal location markers one by one as a journey path so users know which location to click next.
- Add a V2 “Ride mode” that turns on only the places I have ridden to. Include Kolar in this mode, but reveal it only when the user zooms in deeply.
- Show childhood photo from Jorhat with eyes redacted for family privacy, animated with a shimmer effect.
- Future V2 journey locations: Cuttack, Odisha, India as “the OG home - the teenage”; Kanpur, Uttar Pradesh, India as “childhood”; Munnar, Kerala, India as “The first long ride”; BR Hills, Karnataka, India as “The first solo”; Udupi, Karnataka, India as “Road trip”.
- V2 globe story stages: first stage is the loading text; second stage is the globe appearing, rotating, and zooming into India; third stage is India changing colors.
- Show ride routes on the globe/map as path lines following the actual roads taken. Hovering or clicking a route should reveal trip context such as the road taken and which trip it belonged to.
- Explore a public photo-gallery flow where Google Photos is only the private curation/source layer, not the public viewer. Selected images should sync into public storage such as S3, Cloudflare R2, Supabase Storage, or Vercel Blob, then render through a custom gallery page.
- Keep comments and likes inside the custom app instead of relying on Google Photos shared-album reactions. Public viewers can see comments and aggregate counts, but should not see who else liked or commented. Support anonymous or pseudonymous comments, moderation, and optional rate limits.
- Fetch gallery images lazily instead of loading the full album at once. Use paginated API calls such as `limit=24&cursor=...`, lazy image loading, responsive thumbnails, and full-resolution image fetch only when a visitor opens a photo.
- Avoid treating Google Photos URLs as permanent public image URLs. Google Photos media URLs are temporary, and API access is constrained, so long-lived public albums need an app-owned storage/cache layer.

## V2 animation ledger

- Portfolio loader start delay: 100ms.
- Portfolio loader text fade in: 1200ms.
- Portfolio loader decrypted text: 115ms per character.
- Portfolio loader post-decrypt hold: 1000ms.
- Portfolio loader text exit: 1200ms.
- Portfolio loader overlay exit: 800ms visual fade, 900ms unmount wait.
- Globe fade in: 700ms.
- Globe Madrid-to-India intro flight: 7800ms.
- Globe intro state sync: 120ms.
- Globe India color/theme transition: 900ms.
- Bangalore marker fade in: 900ms.
- Bangalore marker scale transition: 220ms.
- Bangalore marker pulse: 3200ms loop.
- Click-me hint panel fade/slide: 360ms.
- Click-me hint line draw: 680ms.
- Click-me hint text fade/slide: 360ms after 700ms delay.
- Marker hover callout line draw: 200ms.
- Marker hover content fade/slide: starts after the 200ms callout line draw, then animates for 360ms.
- Marker hover content hide: 320ms.
- Marker click callout extension into modal anchor: 1200ms.
- Marker click globe focus camera move: 1200ms.
- Marker content modal open: 100ms.
- Marker content overlay fade in: tied to modal open progress, 100ms.
- Marker content opacity: 100ms.
- Marker content modal close: 100ms.
- Marker content overlay fade out: tied to modal close progress, 100ms.
- Marker callout retract on close: 200ms.
- Globe return camera move after content close: starts after callout retract, 1200ms.
