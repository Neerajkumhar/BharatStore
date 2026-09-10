'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

function formatNumber(n: number, decimals: number) {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function CountUp({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1200,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(value * eased);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        if (ref.current) observer.unobserve(ref.current);
      },
      { threshold: 0.4 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(display, decimals)}
      {suffix}
    </span>
  );
}