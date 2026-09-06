'use client';

import React, { useState } from 'react';
import {
  GripVertical, Eye, EyeOff, Trash2, Plus, ChevronDown, ChevronUp,
  Layers, Image, Star, Grid3x3, Megaphone, Info, ShieldCheck,
  MessageSquare, HelpCircle, Phone, LayoutTemplate,
} from 'lucide-react';
import { COMPONENT_REGISTRY, type SectionType, SECTION_TYPES } from '@bharatstore/shared/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Megaphone, Image, Layers, Star, Grid3x3, Info, ShieldCheck, MessageSquare, HelpCircle, Phone, LayoutTemplate,
};

interface SectionItem {
  id: string;
  type: string;
  config: Record<string, unknown>;
  visible: boolean;
  order: number;
}

interface BuilderSidebarProps {
  sections: SectionItem[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddSection: (type: SectionType) => void;
  templateId: string | null;
}

const ADDABLE_TYPES = Object.values(SECTION_TYPES).filter(
  (t) => !COMPONENT_REGISTRY[t].isRequired
);

export function BuilderSidebar({
  sections, selectedSectionId, onSelectSection, onToggleVisibility,
  onDeleteSection, onReorder, onAddSection, templateId,
}: BuilderSidebarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      onReorder(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full overflow-hidden">
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sections</h3>
          <span className="text-2xs text-slate-400">{sorted.length}</span>
        </div>
        {templateId && (
          <div className="text-2xs text-slate-400 bg-slate-50 rounded px-2 py-1">
            Template: <span className="font-semibold text-slate-600">{templateId}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sorted.map((section, index) => {
          const def = COMPONENT_REGISTRY[section.type as SectionType];
          if (!def) return null;
          const Icon = iconMap[def.icon] || Layers;
          const isSelected = section.id === selectedSectionId;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              onClick={() => onSelectSection(section.id)}
              className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : isDragOver
                    ? 'bg-amber-50 border border-amber-300'
                    : 'hover:bg-slate-50 text-slate-700'
              } ${!section.visible ? 'opacity-50' : ''}`}
            >
              <GripVertical className="h-3.5 w-3.5 text-slate-300 cursor-grab shrink-0" />
              <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-xs font-medium truncate flex-1">{def.label}</span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(section.id); }}
                  className="p-0.5 rounded hover:bg-slate-200 transition"
                  title={section.visible ? 'Hide' : 'Show'}
                >
                  {section.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </button>
                {!def.isDeletable ? null : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSection(section.id); }}
                    className="p-0.5 rounded hover:bg-red-100 text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2 border-t border-slate-100 relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-1.5 p-2 text-xs font-bold text-slate-600 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Section</span>
        </button>

        {showAddMenu && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto z-50">
            {ADDABLE_TYPES.map((type) => {
              const def = COMPONENT_REGISTRY[type];
              const Icon = iconMap[def.icon] || Layers;
              return (
                <button
                  key={type}
                  onClick={() => { onAddSection(type); setShowAddMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition"
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                  <div className="text-left">
                    <div className="font-medium">{def.label}</div>
                    <div className="text-2xs text-slate-400">{def.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
