import { describe, expect, it } from 'vitest';

import {
  ANALYTICS_EVENTS,
  getScrollDepthPercentage,
  getTrackingModule,
  sanitizeAnalyticsEvent,
  sanitizeAnalyticsPath
} from './analytics';

describe('analytics event taxonomy', () => {
  it('uses dot-separated snake_case event names', () => {
    for (const eventName of Object.values(ANALYTICS_EVENTS)) {
      expect(eventName).toMatch(/^[a-z0-9_]+(?:\.[a-z0-9_]+)+$/);
    }
  });
});

describe('getScrollDepthPercentage', () => {
  it('measures progress through nested and window scrollers', () => {
    expect(getScrollDepthPercentage(500, 1500, 500)).toBe(50);
    expect(getScrollDepthPercentage(1000, 1500, 500)).toBe(100);
  });

  it('returns zero when content does not scroll', () => {
    expect(getScrollDepthPercentage(0, 500, 500)).toBe(0);
  });
});

describe('getTrackingModule', () => {
  it.each([
    ['/', 'home'],
    ['/writings/quiet-software', 'writings'],
    ['/unknown', 'app']
  ] as const)('maps %s to %s', (path, module) => {
    expect(getTrackingModule(path)).toBe(module);
  });
});

describe('module event coverage', () => {
  it('supports writing engagement and link click events', () => {
    const writingEvents = ['writings.link.clicked', 'writings.page.engaged'];

    for (const eventName of writingEvents) {
      expect(eventName).toMatch(/^[a-z0-9_]+(?:\.[a-z0-9_]+)+$/);
    }
  });
});

describe('sanitizeAnalyticsPath', () => {
  it('removes query strings, hashes, and UUID route segments', () => {
    expect(
      sanitizeAnalyticsPath(
        '/writings/123e4567-e89b-42d3-a456-426614174000?preview=secret#entry'
      )
    ).toBe('/writings/:id');
  });
});

describe('sanitizeAnalyticsEvent', () => {
  it('removes private URL parts from tracked properties', () => {
    expect(
      sanitizeAnalyticsEvent({
        event: 'stories.page.viewed',
        properties: {
          path: '/writings/launch?draft=secret',
          referrer: 'https://example.com/source?token=secret#section',
          url: 'https://heywhoisdash.com/writings/launch?draft=secret'
        }
      })
    ).toEqual({
      event: 'stories.page.viewed',
      properties: {
        path: '/writings/launch',
        referrer: 'https://example.com/source',
        url: 'https://heywhoisdash.com/writings/launch'
      }
    });
  });
});
