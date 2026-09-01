'use client';

import type { Mixpanel } from 'mixpanel-browser';

type AnalyticsProperty = boolean | number | string | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsProperty>;

export type TrackingModule =
  | 'about'
  | 'app'
  | 'blogs'
  | 'home'
  | 'projects'
  | 'stories'
  | 'v2'
  | 'v3'
  | 'work'
  | 'writings';

type ModuleEvent = `${TrackingModule}.${
  | 'element.clicked'
  | 'form.submitted'
  | 'input.changed'
  | 'page.scrolled'
  | 'page.viewed'}`;

export const ANALYTICS_EVENTS = {
  appPromiseFailed: 'app.promise.failed',
  appRuntimeFailed: 'app.runtime.failed',
  v2IntroCompleted: 'v2.intro.completed',
  v2MusicControlUsed: 'v2.music.control.used',
  v2MusicMediaFailed: 'v2.music.media.failed',
  v2MusicPlaybackFailure: 'v2.music.playback.failure',
  v2MusicPlaybackInitiated: 'v2.music.playback.initiated',
  v2MusicPlaybackSuccess: 'v2.music.playback.success',
  v2SocialLinkClicked: 'v2.social_link.clicked',
  v2WritingsPanelClosed: 'v2.writings_panel.closed',
  v2WritingsPanelOpened: 'v2.writings_panel.opened',
  v2WorkCategoryViewed: 'v2.work_category.viewed',
  v2WorkPanelClosed: 'v2.work_panel.closed',
  v2WorkPanelOpened: 'v2.work_panel.opened'
} as const;

export type AnalyticsEventName =
  | (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]
  | ModuleEvent;

const SCROLL_CHECKPOINTS = [25, 50, 75, 100] as const;
const TRACKING_VERSION = 1;
const UUID_SEGMENT =
  /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?=\/|$)/gi;

let interactionsRegistered = false;
let mixpanelPromise: Promise<Mixpanel | null> | null = null;
let scrollFrameRequested = false;
const trackedScrollCheckpoints = new Set<string>();

export function initializeAnalytics() {
  return loadMixpanel().then((mixpanel) => mixpanel !== null);
}

export function trackEvent(
  eventName: AnalyticsEventName,
  properties?: AnalyticsProperties
) {
  void loadMixpanel().then((mixpanel) => {
    mixpanel?.track(eventName, {
      ...getBaseProperties(),
      ...properties
    });
  });
}

export function trackPageView(pathname: string, pageTitle: string) {
  const path = sanitizeAnalyticsPath(pathname);

  trackEvent(`${getTrackingModule(path)}.page.viewed`, {
    page_title: pageTitle,
    path
  });
}

export function getTrackingModule(pathname: string): TrackingModule {
  if (pathname.startsWith('/stories')) return 'stories';
  if (pathname.startsWith('/blogs')) return 'blogs';
  if (pathname.startsWith('/writings')) return 'writings';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/code')) return 'work';
  if (pathname.startsWith('/me')) return 'about';
  if (pathname.startsWith('/v2')) return 'v2';
  if (pathname.startsWith('/v3')) return 'v3';
  if (pathname === '/' || pathname.startsWith('/home')) return 'home';

  return 'app';
}

export function sanitizeAnalyticsPath(pathname: string) {
  return pathname.split(/[?#]/, 1)[0].replace(UUID_SEGMENT, '/:id');
}

export function sanitizeAnalyticsEvent<
  T extends { properties: Record<string, unknown> }
>(event: T) {
  const properties = { ...event.properties };

  for (const [key, value] of Object.entries(properties)) {
    if (typeof value !== 'string') continue;

    const normalizedKey = key.toLowerCase();

    if (
      normalizedKey.includes('url') ||
      normalizedKey.includes('href') ||
      normalizedKey.includes('referrer')
    ) {
      properties[key] = sanitizeUrl(value);
    } else if (normalizedKey.includes('path')) {
      properties[key] = sanitizeAnalyticsPath(value);
    }
  }

  return { ...event, properties };
}

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
        hooks: {
          before_send_events: sanitizeAnalyticsEvent
        },
        ignore_dnt: false,
        persistence: 'localStorage',
        save_referrer: false,
        stop_utm_persistence: true,
        track_pageview: false
      });

      registerGlobalTracking();

      return mixpanel;
    })
    .catch(() => null);

  return mixpanelPromise;
}

function getBaseProperties(): AnalyticsProperties {
  const path = sanitizeAnalyticsPath(window.location.pathname);
  const searchParams = new URLSearchParams(window.location.search);

  return {
    app: 'portfolio',
    environment: process.env.NODE_ENV,
    path,
    referrer: sanitizeUrl(document.referrer),
    url: `${window.location.origin}${path}`,
    utm_campaign: searchParams.get('utm_campaign'),
    utm_content: searchParams.get('utm_content'),
    utm_medium: searchParams.get('utm_medium'),
    utm_source: searchParams.get('utm_source'),
    utm_term: searchParams.get('utm_term'),
    version: TRACKING_VERSION
  };
}

function registerGlobalTracking() {
  if (interactionsRegistered) return;

  interactionsRegistered = true;
  registerInteractionTracking();
  registerErrorTracking();
}

function registerInteractionTracking() {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const interactiveElement = target.closest(
        "a, button, [role='button'], input[type='button'], input[type='submit']"
      );
      if (!interactiveElement) return;

      const trackingModule = getTrackingModule(window.location.pathname);
      const properties: AnalyticsProperties = {
        element_type: getElementType(interactiveElement)
      };

      if (interactiveElement instanceof HTMLAnchorElement) {
        properties.link_destination = getLinkDestination(interactiveElement);
      }

      trackEvent(`${trackingModule}.element.clicked`, properties);
    },
    true
  );

  document.addEventListener(
    'submit',
    () => {
      const trackingModule = getTrackingModule(window.location.pathname);
      trackEvent(`${trackingModule}.form.submitted`);
    },
    true
  );

  document.addEventListener(
    'change',
    (event) => {
      const target = event.target;

      if (
        !(
          target instanceof HTMLInputElement ||
          target instanceof HTMLSelectElement ||
          target instanceof HTMLTextAreaElement
        )
      ) {
        return;
      }

      const trackingModule = getTrackingModule(window.location.pathname);
      trackEvent(`${trackingModule}.input.changed`, {
        input_type:
          target instanceof HTMLInputElement
            ? target.type
            : target.tagName.toLowerCase()
      });
    },
    true
  );

  window.addEventListener(
    'scroll',
    () => {
      if (scrollFrameRequested) return;

      scrollFrameRequested = true;
      window.requestAnimationFrame(() => {
        scrollFrameRequested = false;
        trackScrollDepth();
      });
    },
    { passive: true }
  );
}

function trackScrollDepth() {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) return;

  const percentage = Math.min(
    100,
    Math.round((window.scrollY / scrollableHeight) * 100)
  );
  const path = sanitizeAnalyticsPath(window.location.pathname);
  const trackingModule = getTrackingModule(path);

  for (const checkpoint of SCROLL_CHECKPOINTS) {
    const checkpointKey = `${path}:${checkpoint}`;

    if (
      percentage < checkpoint ||
      trackedScrollCheckpoints.has(checkpointKey)
    ) {
      continue;
    }

    trackedScrollCheckpoints.add(checkpointKey);
    trackEvent(`${trackingModule}.page.scrolled`, {
      scroll_depth_percentage: checkpoint
    });
  }
}

function registerErrorTracking() {
  window.addEventListener('error', (event) => {
    trackEvent(ANALYTICS_EVENTS.appRuntimeFailed, {
      error_message: sanitizeErrorMessage(event.message),
      error_name: event.error instanceof Error ? event.error.name : 'Error'
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackEvent(ANALYTICS_EVENTS.appPromiseFailed, {
      error_message:
        event.reason instanceof Error
          ? sanitizeErrorMessage(event.reason.message)
          : 'Unhandled promise rejection',
      error_name:
        event.reason instanceof Error ? event.reason.name : 'UnhandledRejection'
    });
  });
}

function getElementType(element: Element) {
  if (element instanceof HTMLAnchorElement) return 'link';
  if (element.getAttribute('role') === 'button') return 'button';
  if (element instanceof HTMLInputElement) return element.type;

  return element.tagName.toLowerCase();
}

function getLinkDestination(link: HTMLAnchorElement) {
  if (link.protocol === 'mailto:') return 'email';
  if (link.origin !== window.location.origin) return 'external';

  return 'internal';
}

function sanitizeErrorMessage(message: string) {
  return message.replace(/(https?:\/\/[^\s?#]+)[^\s]*/gi, '$1').slice(0, 250);
}

function sanitizeUrl(value: string) {
  if (!value) return value;

  try {
    const baseUrl =
      typeof window === 'undefined'
        ? 'https://portfolio.local'
        : window.location.origin;
    const url = new URL(value, baseUrl);

    return `${url.origin}${sanitizeAnalyticsPath(url.pathname)}`;
  } catch {
    return sanitizeAnalyticsPath(value);
  }
}
