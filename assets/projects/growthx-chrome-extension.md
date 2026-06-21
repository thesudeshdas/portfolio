---
title: Elevate Browser Extension
description: Chrome extension for ATS detection, resume and social autofill, LinkedIn job scraping, saved jobs and AI resume review.
category: work
status: active
role: Solo Engineer
highlight: 2,830 resume reviews and 516 saved jobs recorded
year: 2024-2025
organisation: GrowthX
cover:
live: https://chromewebstore.google.com/detail/gaaeokfljnaahnemphknpchoimmbmhjj
techStack: ['react', 'typescript', 'vite', 'redux']
featured: true
order: 3
---

Architected the complete Chrome Extension (Manifest V3) with full product ownership: content scripts for DOM manipulation, background service worker for message routing, and React popup UI.

Built a multi-platform autofill engine filling forms across 6 ATS platforms (Lever, Greenhouse v1/v2, Freshteam, Keka, Zoho Recruit) using platform-specific DOM selectors, DataTransfer API for resume uploads, and MutationObserver for upload confirmation.

Implemented a three-layer IPC system (React popup → service worker → content script) handling 12+ message types, cross-origin authentication sync between the web app and extension, and job insights with AI-powered resume-to-job compatibility checking.

Shipped Apply via GX job assistant, ATS detection, resume/social autofill,
LinkedIn job scraping, saved jobs and AI resume review flows. Verified
production evidence includes 2,830 resume reviews and 516 jobs saved through
the extension.

Integrated Amplitude analytics through a backend proxy with 20+ instrumented events.
