'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionPrimitiveProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
}

export function AccordionPrimitive({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className = '',
}: AccordionPrimitiveProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return allowMultiple ? [...prev, id] : [id];
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all"
          >
            <button
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-900 text-sm hover:bg-slate-50 transition"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-slate-900' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
