---
title: AI Career Roadmap
description: AI-powered career roadmap generator using Anthropic Claude — with background job processing, versioned storage, and async polling architecture.
category: work
status: active
role: Full Stack Engineer
highlight: Eliminated 504 timeouts via async polling architecture
year: 2025-2026
organisation: GrowthX
cover:
live: https://growthx.club/ai-roadmap
techStack: ['nextjs', 'typescript', 'openai', 'aws', 'express', 'mongodb']
featured: true
order: 3
---

Built an end-to-end AI roadmap generation system integrating Anthropic Claude on the backend with a full service wrapper, model registry (Opus, Sonnet, Haiku with cost definitions), and configuration.

The pipeline includes LinkedIn profile enrichment, a personalization flow with use-case questions and user context input, LLM prompt templating, and HTML roadmap output stored on S3 with CloudFront signed URL access.

Converted synchronous generation (which caused 504 timeouts) to background jobs with polling: POST returns 202 with job ID, GET /status/:id for frontend polling, concurrent generation guard (409 Conflict), and stale PENDING auto-fail after 10 minutes.

Implemented versioned roadmap storage with a unique compound index on {user, version} to prevent race conditions, plus an email notification pipeline triggered post-generation via SES.
