'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Check, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';

export interface PickerImage {
  url: string;
  label: string;
}

interface ImagePickerModalProps {
  isOpen: boolean;
  title: string;
  currentImage: string;
  gallery: PickerImage[];
  isSaving?: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function ImagePickerModal({
  isOpen,
  title,
  currentImage,
  gallery,
  isSaving = false,
  onClose,
  onSelect,
}: ImagePickerModalProps) {
  const [customUrl, setCustomUrl] = useState(currentImage || '');
  const [appliedUrl, setAppliedUrl] = useState(currentImage || '');
  const [chosen, setChosen] = useState('');

  const images = useMemo(() => {
    const seen = new Set<string>();
    const out: PickerImage[] = [];
    if (currentImage && !seen.has(currentImage)) {
      out.push({ url: currentImage, label: 'Current Image' });
      seen.add(currentImage);
    }
    for (const g of gallery) {
      if (seen.has(g.url)) continue;
      seen.add(g.url);
      out.push(g);
    }
    return out;
  }, [gallery, currentImage]);

  useEffect(() => {
    if (isOpen) {
      setAppliedUrl(currentImage || '');
      setCustomUrl(currentImage || '');
      setChosen('');
    }
  }, [isOpen, currentImage]);

  if (!isOpen) return null;

  const choose = (url: string) => {
    if (isSaving) return;
    setChosen(url);
    setAppliedUrl(url);
    onSelect(url);
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600">
              <ImageIcon className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{title}</h3>
              <p className="text-2xs text-slate-500">Pick an image or paste an image URL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white transition disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Current image preview */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {appliedUrl ? (
                <img src={appliedUrl} alt="Selected" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-7 w-7 text-slate-300" />
              )}
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-slate-700">{appliedUrl ? 'Applied Image' : 'No image selected'}</p>
              {appliedUrl && (
                <a href={appliedUrl} target="_blank" rel="noreferrer" className="text-2xs text-amber-600 hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Open in new tab
                </a>
              )}
            </div>
          </div>

          {/* Image gallery */}
          {images.length > 0 ? (
            <div>
              <p className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Choose from store images
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((img) => {
                  const active = appliedUrl === img.url;
                  return (
                    <button
                      key={img.url}
                      type="button"
                      disabled={isSaving}
                      onClick={() => choose(img.url)}
                      className={`group relative rounded-xl overflow-hidden border transition text-left aspect-square ${
                        active
                          ? 'border-amber-500 ring-2 ring-amber-200'
                          : 'border-slate-200 hover:border-slate-400'
                      } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-1.5 py-1">
                        <p className="text-[10px] leading-tight font-semibold text-white truncate">{img.label}</p>
                      </div>
                      {active && (
                        <span className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No inspect images available.</p>
          )}

          {/* Custom URL */}
          <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/60">
            <p className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Or paste an image URL
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customUrl.trim() && !isSaving) {
                    setChosen(customUrl.trim());
                    setAppliedUrl(customUrl.trim());
                    onSelect(customUrl.trim());
                  }
                }}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              />
              <button
                type="button"
                disabled={isSaving || !customUrl.trim()}
                onClick={() => choose(customUrl.trim())}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-40 flex items-center gap-1.5"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 text-amber-400" />}
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
          <p className="text-2xs text-slate-400">
            {chosen && appliedUrl === chosen
              ? 'Image updated — Left panel shows the change instantly.'
              : 'The change is saved to this section automatically.'}
          </p>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-40"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}