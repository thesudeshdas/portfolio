'use client';

import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties
} from 'react';

interface V3RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  delayStep?: number;
}

export default function V3RevealGroup({
  children,
  className,
  delayStep = 90
}: V3RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
  }, []);

  return (
    <div
      ref={ref}
      className={`v3-reveal-group ${className ?? ''}`}
      data-visible={isVisible ? 'true' : 'false'}
    >
      {Children.map(children, (child, index) => (
        <div
          className='v3-reveal-item'
          style={
            {
              '--v3-reveal-delay': `${index * delayStep}ms`
            } as CSSProperties
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}
