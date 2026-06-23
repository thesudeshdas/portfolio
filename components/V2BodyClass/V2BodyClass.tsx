'use client';

import { useEffect } from 'react';

export default function V2BodyClass() {
  useEffect(() => {
    document.body.classList.add('v2-route');

    return () => {
      document.body.classList.remove('v2-route');
    };
  }, []);

  return null;
}
