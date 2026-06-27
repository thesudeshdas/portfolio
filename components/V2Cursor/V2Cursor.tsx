'use client';

import { useEffect, useRef, useState } from 'react';

const COFFEE_CURSOR = '#2f1d13';
const CURSOR_SIZE_PX = 16;
const MOVING_CURSOR_SCALE = 0.5;
const WHITE_CURSOR = '#ffffff';

function getLuminance(color: string) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

  if (!match) {
    return 0;
  }

  const [, red, green, blue] = match.map(Number);

  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
}

function getCursorColor(target: Element | null) {
  let element = target;

  while (element instanceof HTMLElement) {
    if (element instanceof HTMLCanvasElement) {
      const canvasCursorColor = window
        .getComputedStyle(document.body)
        .getPropertyValue('--v2-cursor-canvas-color')
        .trim();

      if (canvasCursorColor) {
        return canvasCursorColor;
      }
    }

    const backgroundColor = window.getComputedStyle(element).backgroundColor;

    if (
      backgroundColor &&
      backgroundColor !== 'transparent' &&
      !backgroundColor.endsWith(', 0)')
    ) {
      return getLuminance(backgroundColor) > 0.45
        ? COFFEE_CURSOR
        : WHITE_CURSOR;
    }

    element = element.parentElement;
  }

  return WHITE_CURSOR;
}

export default function V2Cursor() {
  const [cursor, setCursor] = useState({
    color: WHITE_CURSOR,
    isMoving: false,
    isVisible: false,
    x: 0,
    y: 0
  });
  const moveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY);

      if (moveTimeoutRef.current !== null) {
        window.clearTimeout(moveTimeoutRef.current);
      }

      setCursor({
        color: getCursorColor(target),
        isMoving: true,
        isVisible: true,
        x: event.clientX,
        y: event.clientY
      });

      moveTimeoutRef.current = window.setTimeout(() => {
        setCursor((currentCursor) => ({
          ...currentCursor,
          isMoving: false
        }));
      }, 120);
    };

    const handlePointerLeave = () => {
      setCursor((currentCursor) => ({
        ...currentCursor,
        isVisible: false
      }));
    };
    const handleWheel = () => {
      setCursor((currentCursor) => ({
        ...currentCursor,
        isVisible: false
      }));
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('wheel', handleWheel, {
      capture: true,
      passive: true
    });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      if (moveTimeoutRef.current !== null) {
        window.clearTimeout(moveTimeoutRef.current);
      }

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('wheel', handleWheel, { capture: true });
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return (
    <span
      aria-hidden='true'
      className='pointer-events-none fixed z-[13000] rounded-full border transition-[opacity,border-color,transform] duration-150 ease-out'
      style={{
        borderColor: cursor.color,
        height: `${CURSOR_SIZE_PX}px`,
        opacity: cursor.isVisible ? 1 : 0,
        transform: `translate3d(${cursor.x - CURSOR_SIZE_PX / 2}px, ${
          cursor.y - CURSOR_SIZE_PX / 2
        }px, 0) scale(${cursor.isMoving ? MOVING_CURSOR_SCALE : 1})`,
        width: `${CURSOR_SIZE_PX}px`
      }}
    />
  );
}
