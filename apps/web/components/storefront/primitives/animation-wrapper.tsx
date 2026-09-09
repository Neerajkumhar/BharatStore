'use client';

import React, { useEffect, useState, useRef } from 'react';

export type AnimationType = 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';

export interface AnimationWrapperProps {
  children: React.ReactNode;
  animation?: AnimationType;
  className?: string;
}

export function AnimationWrapper({
  children,
  animation = 'none',
  className = '',
}: AnimationWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animation === 'none') {
      setIsVisible(true);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animation]);

  if (animation === 'none') {
    return <div className={className}>{children}</div>;
  }

  const animClasses: Record<AnimationType, string> = {
    none: '',
    fade: isVisible ? 'opacity-100 transition-opacity duration-700' : 'opacity-0',
    'fade-up': isVisible
      ? 'opacity-100 translate-y-0 transition-all duration-700'
      : 'opacity-0 translate-y-8',
    'slide-up': isVisible
      ? 'opacity-100 translate-y-0 transition-all duration-500'
      : 'opacity-0 translate-y-12',
    scale: isVisible
      ? 'opacity-100 scale-100 transition-all duration-500'
      : 'opacity-0 scale-95',
  };

  return (
    <div ref={ref} className={`${animClasses[animation]} ${className}`}>
      {children}
    </div>
  );
}
