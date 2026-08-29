'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';

export default function Analytics() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedPathRef.current === pathname) {
      return;
    }

    lastTrackedPathRef.current = pathname;
    trackEvent(ANALYTICS_EVENTS.pageViewed, {
      page_path: pathname,
      page_title: document.title
    });
  }, [pathname]);

  return null;
}
