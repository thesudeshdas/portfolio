# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `pnpm dev` (runs on port 3003)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **No test framework** is configured

Pre-commit hook runs `lint-staged` (ESLint + Prettier) via Husky.

## Architecture

This is a personal portfolio site built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS 4.0**.

### Routing & Pages

App Router file-based routing under `app/`. Key routes:

- `/` — Homepage with hero and latest content
- `/stories` and `/stories/[entry]` — Blog/story listing and individual entries
- `/code` — Dev projects showcase
- `/me` — About page with journey timeline, skill bank, FAQ
- `/work` — Work experience

### Content System

Stories are **static markdown files** in `assets/stories/` with YAML frontmatter (`title`, `date`, `tags`, `description`, `cover`). Parsed server-side by `lib/stories.ts` which exports `getAllStories()` and `getStoryBySlug(slug)`. Rendered with `react-markdown`.

Other content (projects, career timeline, skills, FAQ) lives in co-located `.data.ts` files next to their page sections (e.g., `app/code/dev.data.ts`, `app/me/sections/journey/journey.data.ts`).

Story pages use ISR with `revalidate = 300` (5 minutes).

### Component Patterns

- **UI primitives**: shadcn/ui (new-york style, zinc base) in `components/ui/` — built on Radix UI
- **Feature components**: `components/` with folder-per-component pattern (e.g., `StoryCard/StoryCard.tsx`)
- **Barrel exports**: `components/index.ts` re-exports all components
- **Client vs Server**: Pages are async server components. Components needing interactivity (nav, theme toggle, hover states) use `'use client'`. `lib/stories.ts` is server-only.
- **Class merging**: Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge)
- **Component variants**: `class-variance-authority` for variant props

### Types

Type definitions in `types/` organized by domain (e.g., `types/story/story.types.ts`). Interfaces prefixed with `I` (e.g., `IStory`).

### Path Alias

`@/*` maps to the project root (e.g., `@/components`, `@/lib/utils`).

## Code Style

- **Single quotes** everywhere (JS and JSX)
- **No trailing commas**
- **No `console.log`** — ESLint enforces `no-console: error`
- **Single attribute per line** in JSX
- Prettier with `prettier-plugin-tailwindcss` for class sorting
- Print width: 80 characters
