'use client';

import { useEffect } from 'react';

export default function V3BodyClass() {
  useEffect(() => {
    document.body.classList.add('v3-route');

    return () => {
      document.body.classList.remove('v3-route');
    };
  }, []);

  return null;
}
