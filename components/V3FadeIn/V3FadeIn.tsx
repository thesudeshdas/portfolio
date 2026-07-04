'use client';

import { useEffect, useRef, useState } from 'react';

interface V3FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function V3FadeIn({
  children,
  className,
  delay = 0
}: V3FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(el);
        }
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.1
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease'
      }}
    >
      {children}
    </div>
  );
}
