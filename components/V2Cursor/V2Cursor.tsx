'use client';

import { useEffect, useRef, useState } from 'react';

const CURSOR_SIZE_PX = 16;
const CURSOR_IDLE_HIDE_MS = 1000;

export default function V2Cursor() {
  const idleTimeoutRef = useRef<number | null>(null);
  const [cursor, setCursor] = useState({
    isVisible: false,
    x: 0,
    y: 0
  });

  useEffect(() => {
    const clearIdleTimeout = () => {
      if (idleTimeoutRef.current === null) {
        return;
      }

      window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    };

    const hideCursor = () => {
      setCursor((currentCursor) => ({
        ...currentCursor,
        isVisible: false
      }));
    };

    const handlePointerMove = (event: PointerEvent) => {
      clearIdleTimeout();

      const isOverNativeCursorArea =
        event.target instanceof HTMLElement &&
        event.target.closest('[data-v2-content-cursor="true"]');

      setCursor({
        isVisible: !isOverNativeCursorArea,
        x: event.clientX,
        y: event.clientY
      });

      idleTimeoutRef.current = window.setTimeout(() => {
        hideCursor();
      }, CURSOR_IDLE_HIDE_MS);
    };

    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('mouseleave', hideCursor);

    return () => {
      clearIdleTimeout();
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', hideCursor);
    };
  }, []);

  return (
    <span
      aria-hidden='true'
      className='pointer-events-none fixed z-[13000] rounded-full border transition-opacity duration-300 ease-out'
      style={{
        borderColor: 'var(--v2-cursor-canvas-color, #ffffff)',
        height: `${CURSOR_SIZE_PX}px`,
        left: `${cursor.x - CURSOR_SIZE_PX / 2}px`,
        opacity: cursor.isVisible ? 1 : 0,
        top: `${cursor.y - CURSOR_SIZE_PX / 2}px`,
        width: `${CURSOR_SIZE_PX}px`
      }}
    />
  );
}
