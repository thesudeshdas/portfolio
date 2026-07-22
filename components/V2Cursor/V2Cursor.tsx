'use client';

import { motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

const CURSOR_COLOR = '#a1a1aa';
const CURSOR_SIZE_PX = 16;
const CURSOR_IDLE_HIDE_MS = 1000;
const CURSOR_MOVE_RESET_MS = 120;
const MOVING_CURSOR_SCALE = 0.5;

export default function V2Cursor() {
  const idleTimeoutRef = useRef<number | null>(null);
  const moveTimeoutRef = useRef<number | null>(null);
  const opacity = useMotionValue(0);
  const scale = useMotionValue(1);
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(-CURSOR_SIZE_PX);
  const y = useMotionValue(-CURSOR_SIZE_PX);

  useEffect(() => {
    const clearTimeoutRef = (timeoutRef: typeof idleTimeoutRef) => {
      if (timeoutRef.current === null) {
        return;
      }

      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };

    const hideCursor = () => {
      opacity.set(0);
      scale.set(1);
    };

    const handlePointerMove = (event: PointerEvent) => {
      clearTimeoutRef(idleTimeoutRef);
      clearTimeoutRef(moveTimeoutRef);

      const isOverNativeCursorArea =
        event.target instanceof Element &&
        event.target.closest('[data-v2-content-cursor="true"]');

      x.set(event.clientX - CURSOR_SIZE_PX / 2);
      y.set(event.clientY - CURSOR_SIZE_PX / 2);
      opacity.set(isOverNativeCursorArea ? 0 : 1);

      if (isOverNativeCursorArea) {
        scale.set(1);
        return;
      }

      scale.set(shouldReduceMotion ? 1 : MOVING_CURSOR_SCALE);

      moveTimeoutRef.current = window.setTimeout(() => {
        scale.set(1);
      }, CURSOR_MOVE_RESET_MS);

      idleTimeoutRef.current = window.setTimeout(() => {
        hideCursor();
      }, CURSOR_IDLE_HIDE_MS);
    };

    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('mouseleave', hideCursor);

    return () => {
      clearTimeoutRef(idleTimeoutRef);
      clearTimeoutRef(moveTimeoutRef);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', hideCursor);
    };
  }, [opacity, scale, shouldReduceMotion, x, y]);

  return (
    <motion.span
      aria-hidden='true'
      className='pointer-events-none fixed top-0 left-0 z-[13000] rounded-full border transition-[opacity,transform] duration-150 ease-out'
      style={{
        borderColor: CURSOR_COLOR,
        height: `${CURSOR_SIZE_PX}px`,
        opacity,
        scale,
        width: `${CURSOR_SIZE_PX}px`,
        x,
        y
      }}
    />
  );
}
