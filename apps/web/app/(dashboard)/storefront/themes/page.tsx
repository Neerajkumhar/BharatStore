'use client';

import React, { useEffect, useState } from 'react';
import { ThemeGallery } from '@/components/storefront/theme-gallery';

export default function StorefrontThemesPage() {
  const [loading, setLoading] = useState(true);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/storefront/builder');
        const json = await res.json();
        if (json.success) {
          setCurrentTemplateId(json.data.draftConfig?.templateId || null);
        }
      } catch (err) {
        console.error('Failed to load current theme:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading theme gallery...</p>
        </div>
      </div>
    );
  }

  return <ThemeGallery currentTemplateId={currentTemplateId} />;
}