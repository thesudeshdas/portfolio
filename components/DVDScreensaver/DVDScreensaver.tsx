'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const COLORS = [
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  '#ff8800',
  '#8800ff'
];

const MESSAGES = [
  'Who is Dash?',
  'A software engineer',
  'Also a motorcyclist',
  'And a traveller',
  'A reader of books',
  'A lover of coffee',
  'A curious mind'
];

const INACTIVITY_TIMEOUT = 10_000;
const SPEED = 2;
const FADE_DURATION = 800;

function getRandomColor(current: string): string {
  const filtered = COLORS.filter((c) => c !== current);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export default function DVDScreensaver() {
  const [isActive, setIsActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  const posRef = useRef({ x: 100, y: 100 });
  const velRef = useRef({ dx: SPEED, dy: SPEED });
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (!prefersReducedMotion.current) {
        setIsActive(true);
      }
    }, INACTIVITY_TIMEOUT);
  }, []);

  const handleActivity = useCallback(() => {
    if (!visible) {
      resetTimer();
      return;
    }

    // Fade out then deactivate
    setVisible(false);

    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
    }

    fadeTimerRef.current = setTimeout(() => {
      setIsActive(false);
      setMessageIndex(0);
      resetTimer();
    }, FADE_DURATION);
  }, [visible, resetTimer]);

  // Fade in when activated
  useEffect(() => {
    if (isActive) {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    }
  }, [isActive]);

  // Inactivity event listeners
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'] as const;

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, [handleActivity, resetTimer]);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mql.matches;

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;

      if (e.matches) {
        setIsActive(false);
        setVisible(false);
      }
    };

    mql.addEventListener('change', handler);

    return () => mql.removeEventListener('change', handler);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      return;
    }

    const animate = () => {
      const el = textRef.current;

      if (!el) return;

      const rect = el.getBoundingClientRect();
      const w = window.innerWidth;
      const h = window.innerHeight;

      let { x, y } = posRef.current;
      let { dx, dy } = velRef.current;
      let bounced = false;

      x += dx;
      y += dy;

      if (x + rect.width >= w) {
        x = w - rect.width;
        dx = -dx;
        bounced = true;
      } else if (x <= 0) {
        x = 0;
        dx = -dx;
        bounced = true;
      }

      if (y + rect.height >= h) {
        y = h - rect.height;
        dy = -dy;
        bounced = true;
      } else if (y <= 0) {
        y = 0;
        dy = -dy;
        bounced = true;
      }

      posRef.current = { x, y };
      velRef.current = { dx, dy };

      el.style.transform = `translate(${x}px, ${y}px)`;

      if (bounced) {
        setColor((prev) => getRandomColor(prev));
        setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black ${
        visible ? 'cursor-none' : 'pointer-events-none'
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_DURATION}ms ease-in-out`
      }}
    >
      <div
        ref={textRef}
        style={{ position: 'absolute', left: 0, top: 0, color }}
        className='max-w-[80vw] text-4xl font-bold select-none md:max-w-[50vw] md:text-6xl'
      >
        {MESSAGES[messageIndex]}
      </div>
    </div>
  );
}
