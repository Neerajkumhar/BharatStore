'use client';

import React from 'react';
import Link from 'next/link';

interface AnnouncementSectionProps {
  config: {
    text?: string;
    link?: string;
    visible?: boolean;
    bgColor?: string;
    textColor?: string;
  };
  slug: string;
}

export function AnnouncementSection({ config, slug }: AnnouncementSectionProps) {
  if (!config.visible) return null;

  const content = (
    <span className="font-semibold">{config.text}</span>
  );

  return (
    <div
      className="text-center py-2 px-4 text-xs font-medium"
      style={{ backgroundColor: config.bgColor || '#0f172a', color: config.textColor || '#fbbf24' }}
    >
      {config.link ? (
        <Link href={config.link.startsWith('/') ? config.link : `/store/${slug}${config.link}`}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
