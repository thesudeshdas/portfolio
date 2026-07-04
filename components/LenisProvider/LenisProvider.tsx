'use client';

import { ReactLenis } from 'lenis/react';

const lenisOptions = {
  anchors: true,
  lerp: 0.1,
  prevent: () => document.body.classList.contains('v2-route'),
  smoothWheel: true,
  stopInertiaOnNavigate: true,
  syncTouch: true
};

export default function LenisProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={lenisOptions}
    >
      {children}
    </ReactLenis>
  );
}
