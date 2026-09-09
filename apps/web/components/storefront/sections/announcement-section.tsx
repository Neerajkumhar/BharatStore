'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface AnnouncementSectionProps {
  config: {
    text?: string;
    link?: string;
    visible?: boolean;
    bgColor?: string;
    textColor?: string;
    marquee?: boolean;
    dismissible?: boolean;
  };
  slug: string;
}

export function AnnouncementSection({ config, slug }: AnnouncementSectionProps) {
  const [dismissed, setDismissed] = useState(false);
  if (!config.visible || dismissed) return null;

  const linkUrl = config.link
    ? config.link.startsWith('/')
      ? config.link
      : `/store/${slug}${config.link}`
    : null;

  return (
    <div
      className="relative text-center py-2 px-8 text-xs font-semibold tracking-wide overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor: config.bgColor || '#0f172a',
        color: config.textColor || '#fbbf24',
      }}
    >
      {config.marquee ? (
        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-marquee">
            <span className="mx-8 font-semibold">{config.text}</span>
            <span className="mx-8 font-semibold">{config.text}</span>
            <span className="mx-8 font-semibold">{config.text}</span>
          </div>
        </div>
      ) : linkUrl ? (
        <Link href={linkUrl} className="hover:underline">
          {config.text}
        </Link>
      ) : (
        <span>{config.text}</span>
      )}

      {config.dismissible !== false && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss Announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-75 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
