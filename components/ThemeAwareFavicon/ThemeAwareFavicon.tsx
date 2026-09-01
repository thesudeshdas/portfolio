'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function ThemeAwareFavicon() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const iconPath =
      resolvedTheme === 'dark' ? '/dash-white.png' : '/dash-black.svg';
    const iconHref = new URL(iconPath, document.baseURI).href;
    const syncFavicon = () => {
      const favicon =
        document.querySelector<HTMLLinkElement>("link[rel~='icon']");

      if (favicon && favicon.href !== iconHref) favicon.href = iconHref;
    };

    syncFavicon();

    const observer = new MutationObserver(syncFavicon);
    observer.observe(document.head, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['href']
    });

    return () => observer.disconnect();
  }, [resolvedTheme]);

  return null;
}
