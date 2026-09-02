# Hey, Who Is Dash?

Dash's live portfolio experience, built with Next.js 15, React 19,
TypeScript, and Tailwind CSS 4.

## Routes

- `/` — canonical portfolio experience
- `/writings` — writing index inside the portfolio UI
- `/writings/[slug]` — direct writing entry

New essays, posts, and blogs are all writings. Add them to `assets/writings/`;
do not create new content routes.

## Content

- `assets/projects/` — work-grid project metadata
- `assets/writings/` — published Markdown writing
- `public/dev/` — project covers and hover videos
- `public/audio/lounge/` and `public/images/music/` — music-player media

Legacy routes and UI are preserved under `archive/legacy-portfolio/`. They are
historical reference only and are excluded from active development.

## Commands

```bash
pnpm dev
pnpm test
pnpm build
```

Development runs at [http://localhost:3003](http://localhost:3003).
