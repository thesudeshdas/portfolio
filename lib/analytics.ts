'use client';

import type { Mixpanel } from 'mixpanel-browser';

type AnalyticsProperties = Record<
  string,
  boolean | number | string | null | undefined
>;

export const ANALYTICS_EVENTS = {
  pageViewed: 'Page Viewed',
  v2IntroCompleted: 'V2 Intro Completed',
  v2MusicControlUsed: 'V2 Music Control Used',
  v2SocialLinkClicked: 'V2 Social Link Clicked',
  v2WritingsPanelClosed: 'V2 Writings Panel Closed',
  v2WritingsPanelOpened: 'V2 Writings Panel Opened',
  v2WorkCategoryViewed: 'V2 Work Category Viewed',
  v2WorkPanelClosed: 'V2 Work Panel Closed',
  v2WorkPanelOpened: 'V2 Work Panel Opened'
} as const;

let mixpanelPromise: Promise<Mixpanel | null> | null = null;

function loadMixpanel() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN?.trim();

  if (!token || typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  mixpanelPromise ??= import('mixpanel-browser/src/loaders/loader-module-core')
    .then(({ default: mixpanel }) => {
      mixpanel.init(token, {
        autocapture: false,
        debug: process.env.NODE_ENV !== 'production',
        ignore_dnt: false,
        persistence: 'localStorage',
        property_blacklist: ['$current_url'],
        save_referrer: false,
        stop_utm_persistence: true,
        track_pageview: false
      });
      mixpanel.register({
        app: 'portfolio',
        environment: process.env.NODE_ENV
      });

      return mixpanel;
    })
    .catch(() => null);

  return mixpanelPromise;
}

export function trackEvent(
  eventName: (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS],
  properties?: AnalyticsProperties
) {
  void loadMixpanel().then((mixpanel) => {
    mixpanel?.track(eventName, properties);
  });
}
