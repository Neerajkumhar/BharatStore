'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { STOREFRONT_TEMPLATES, type StorefrontTemplate } from '@bharatstore/shared/constants';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  currentTemplateId: string | null;
}

export function TemplateSelector({ isOpen, onClose, onSelect, currentTemplateId }: TemplateSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Choose a Template</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a starting template for your storefront. Your current draft will be replaced.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STOREFRONT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => { onSelect(template.id); onClose(); }}
                className={`text-left border-2 rounded-xl overflow-hidden transition hover:shadow-md ${
                  currentTemplateId === template.id
                    ? 'border-amber-500 ring-2 ring-amber-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className="h-32 relative"
                  style={{ backgroundColor: template.preview.bgColor }}
                >
                  <div className="absolute inset-0 p-3 flex flex-col">
                    <div className="flex gap-1 mb-2">
                      {template.preview.sections.slice(0, 4).map((s, i) => (
                        <div key={i} className="h-2 rounded-full bg-white/60" style={{ width: `${20 + Math.random() * 30}%` }} />
                      ))}
                    </div>
                    <div className="flex-1 flex items-end">
                      <div className="w-3/4 h-3 rounded" style={{ backgroundColor: template.preview.accentColor + '40' }} />
                    </div>
                  </div>
                  {currentTemplateId === template.id && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-slate-900">{template.name}</h3>
                  <p className="text-2xs text-slate-500 mt-0.5">{template.description}</p>
                  <span className="inline-block mt-1.5 text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                    {template.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
