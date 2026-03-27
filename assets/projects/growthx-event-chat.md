---
title: Real-Time Event Chat
description: Full real-time chat system using Socket.IO — threaded replies, reactions, read-status tracking, and WhatsApp reminder system via RabbitMQ.
category: work
status: active
role: Full Stack Engineer
highlight: Serving 1000+ community events with real-time messaging
year: 2024-2026
organisation: GrowthX
cover:
techStack:
  ['socketio', 'mongodb', 'rabbitmq', 'react', 'typescript', 'reactnative']
featured: true
order: 4
---

Architected a full real-time event chat system using Socket.IO with MongoDB, supporting comments, threaded replies, emoji reactions, message editing/deletion, pinning/unpinning, and soft-delete patterns.

Built role-based chat access (host, co-host, member, non-member) with progressive blur for non-members, host badge indicators, and pre-registration dummy messages. Implemented read status tracking with per-user timestamps, unread count aggregation by distinct senders, and a cron-driven WhatsApp reminder system via AISensy.

Activity ranking via MongoDB aggregation pipeline and automatic registration activity creation with different message flows per registration type.

Ported the chat experience to React Native (Expo) with threaded reply spines, skeleton loading states, animated chat input, and SQLite offline caching.
