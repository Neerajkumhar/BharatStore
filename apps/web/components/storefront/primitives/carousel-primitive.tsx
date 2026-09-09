'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselPrimitiveProps {
  children: React.ReactNode[];
  itemsPerPage?: { desktop?: number; tablet?: number; mobile?: number };
  autoplay?: boolean;
  autoplayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

export function CarouselPrimitive({
  children,
  itemsPerPage = { desktop: 4, tablet: 2, mobile: 1 },
  autoplay = true,
  autoplayInterval = 4000,
  showArrows = true,
  showDots = true,
  className = '',
}: CarouselPrimitiveProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleItems, setVisibleItems] = useState(itemsPerPage.desktop || 4);
  const touchStartX = useRef<number | null>(null);

  // Responsive items per view calculation
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setVisibleItems(itemsPerPage.mobile || 1);
      } else if (w < 1024) {
        setVisibleItems(itemsPerPage.tablet || 2);
      } else {
        setVisibleItems(itemsPerPage.desktop || 4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerPage]);

  const maxIndex = Math.max(0, children.length - visibleItems);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay respecting prefers-reduced-motion
  useEffect(() => {
    if (!autoplay || isPaused || maxIndex <= 0) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, isPaused, maxIndex, autoplayInterval, nextSlide]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  if (!children || children.length === 0) return null;

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }}
        >
          {children.map((child, idx) => (
            <div
              key={idx}
              className="shrink-0 p-2"
              style={{ width: `${100 / visibleItems}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next Controls */}
      {showArrows && maxIndex > 0 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md text-slate-800 flex items-center justify-center hover:bg-slate-900 hover:text-white transition z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md text-slate-800 flex items-center justify-center hover:bg-slate-900 hover:text-white transition z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showDots && maxIndex > 0 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? 'w-6 bg-slate-900' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
