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

- `/` — Canonical V2 portfolio experience
- `/writings` — Writing index inside the V2 interface
- `/writings/[slug]` — Direct writing entry inside the V2 interface

`archive/legacy-portfolio/` is historical reference only. Do not inspect,
import, copy, or use it as implementation context unless the user explicitly
asks about legacy behavior.

### Content System

Project metadata lives in `assets/projects/` and is parsed server-side by
`lib/projects.ts`. Published writings live in `assets/writings/` and are parsed
by `lib/v2-writings.ts` before being rendered with `react-markdown`.

Treat every new essay, post, article, or blog as a writing. Add one Markdown
file to `assets/writings/`; never recreate `/blogs`, `/stories`, or another
content route.

### Component Patterns

- **UI primitive**: shadcn-style button in `components/ui/button.tsx`
- **Feature components**: V2 experience, globe, cursor, loader, analytics, theme, and mobile blocker live under `components/`
- **Client vs Server**: Route pages load project/writing data server-side. Interactive experience components use `'use client'`.
- **Class merging**: Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge)
- **Component variants**: `class-variance-authority` for variant props

### Types

Type definitions in `types/` are organized by active domain. Interfaces use an
`I` prefix.

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
