'use client';

import {
  Children,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState
} from 'react';

interface IV2RevealGroupProps {
  as?: 'div' | 'span';
  children: ReactNode;
  className?: string;
  delayStep?: number;
  rootRef?: RefObject<Element | null>;
}

export default function V2RevealGroup({
  as: Element = 'div',
  children,
  className,
  delayStep = 90,
  rootRef
}: IV2RevealGroupProps) {
  const revealRef = useRef<HTMLDivElement & HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = revealRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        root: rootRef?.current ?? null,
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.1
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootRef]);

  return (
    <Element
      ref={revealRef}
      className={`v2-reveal-group ${className ?? ''}`}
      data-visible={isVisible ? 'true' : 'false'}
    >
      {Children.map(children, (child, index) => (
        <Element
          className='v2-reveal-item'
          style={
            {
              '--v2-reveal-delay': `${index * delayStep}ms`
            } as CSSProperties
          }
        >
          {child}
        </Element>
      ))}
    </Element>
  );
}
