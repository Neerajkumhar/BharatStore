'use client';

import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string;
  content: React.ReactNode;
}

export interface TabsPrimitiveProps {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
}

export function TabsPrimitive({ tabs, defaultTabId, className = '' }: TabsPrimitiveProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTabId || tabs[0]?.id || '');

  if (!tabs || tabs.length === 0) return null;

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-px">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-xs font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-amber-100 text-amber-900 text-3xs font-extrabold px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div>{currentTab?.content}</div>
    </div>
  );
}
