---
title: GrowthX Chrome Extension
description: Chrome extension automating job applications across 6 ATS platforms — reducing application time from ~15 minutes to under 30 seconds.
category: work
status: archived
role: Solo Engineer
highlight: Reduced job application time from ~15 min to under 30 seconds
year: 2024-2025
organisation: GrowthX
cover:
techStack: ['react', 'typescript', 'vite', 'redux']
featured: true
order: 2
---

Architected the complete Chrome Extension (Manifest V3) with full product ownership: content scripts for DOM manipulation, background service worker for message routing, and React popup UI.

Built a multi-platform autofill engine filling forms across 6 ATS platforms (Lever, Greenhouse v1/v2, Freshteam, Keka, Zoho Recruit) using platform-specific DOM selectors, DataTransfer API for resume uploads, and MutationObserver for upload confirmation.

Implemented a three-layer IPC system (React popup → service worker → content script) handling 12+ message types, cross-origin authentication sync between the web app and extension, and job insights with AI-powered resume-to-job compatibility checking.

Integrated Amplitude analytics through a backend proxy with 20+ instrumented events.
