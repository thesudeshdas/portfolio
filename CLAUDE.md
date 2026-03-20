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

## Working Principles

- **Investigate before implementing** — search the codebase for existing patterns, utilities, and services before writing new code. Show what you found and propose an approach before touching files.
- **Use React/Next.js idioms** — always prefer React state, hooks, and Next.js patterns over DOM manipulation or vanilla JS approaches.
- **Minimal changes only** — don't refactor surrounding code, add extra features, or make "improvements" beyond what was asked. If a bug fix touches 2 lines, the diff should be ~2 lines.
- **When fixing bugs** — investigate the exact reproduction path first. Don't reframe bugs as missing features or generalize the problem.

## Git & Deployment

- **Verify branch before committing** — always run `git branch` and confirm you're on the correct branch before any commit.
- **Never commit to `main` directly** unless explicitly asked.
- **Always push after committing** — don't leave commits local. If deploying to Vercel, confirm the push landed.
- **Only commit requested files** — when in doubt, list the files that will be staged and wait for confirmation. Never `git add -A` or `git add .` without asking.
- **One thing at a time for batch fixes** — when given multiple bugs/tasks, work through them sequentially: fix, verify, commit, push, then move to the next.

## Code Style

- **Single quotes** everywhere (JS and JSX)
- **No trailing commas**
- **No `console.log`** — ESLint enforces `no-console: error`
- **Single attribute per line** in JSX
- Prettier with `prettier-plugin-tailwindcss` for class sorting
- Print width: 80 characters
