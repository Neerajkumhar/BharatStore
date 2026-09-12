'use client';

import React, { useState } from 'react';
import {
  GripVertical, Eye, EyeOff, Trash2, Plus, Copy, ChevronUp, ChevronDown,
  Layers, Image, Star, Grid3x3, Megaphone, Info, ShieldCheck,
  MessageSquare, HelpCircle, Phone, LayoutTemplate, Search, Sliders,
  Sparkles, PackageCheck, Zap, Ticket, Truck, Repeat, Camera, Heart,
  Award, Clock, Mail, PanelTop, Menu, Smartphone, Columns, Maximize, Type
} from 'lucide-react';
import {
  COMPONENT_REGISTRY,
  COMPONENT_CATEGORIES,
  type SectionType,
  SECTION_TYPES,
  ComponentCategory,
} from '@bharatstore/shared/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Megaphone, Image, Layers, Star, Grid3x3, Info, ShieldCheck, MessageSquare,
  HelpCircle, Phone, LayoutTemplate, Search, Sliders, Sparkles, PackageCheck,
  Zap, Ticket, Truck, Repeat, Camera, Heart, Award, Clock, Mail,
  PanelTop, Menu, Smartphone, Columns, Maximize, Type,
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
  onDuplicateSection: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onOpenAddModal: () => void;
  templateId: string | null;
}

export function BuilderSidebar({
  sections,
  selectedSectionId,
  onSelectSection,
  onToggleVisibility,
  onDeleteSection,
  onDuplicateSection,
  onReorder,
  onOpenAddModal,
  templateId,
}: BuilderSidebarProps) {
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const filteredSections = sorted.filter((s) => {
    if (filter === 'visible') return s.visible;
    if (filter === 'hidden') return !s.visible;
    return true;
  });

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
    <div className="w-full h-full bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
      {/* Sidebar Header & Add Section Action */}
      <div className="p-3.5 border-b border-slate-100 space-y-3 bg-slate-50/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Page Outline</h3>
            {templateId && (
              <span className="text-3xs text-slate-400 font-mono">Template: {templateId}</span>
            )}
          </div>
          <span className="text-3xs font-extrabold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
            {sections.length} sections
          </span>
        </div>

        <button
          onClick={onOpenAddModal}
          className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add Section</span>
        </button>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-200/60 rounded-lg text-3xs font-bold">
          {(['all', 'visible', 'hidden'] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setFilter(tabKey)}
              className={`flex-1 py-1 rounded-md capitalize transition ${
                filter === tabKey ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tabKey}
            </button>
          ))}
        </div>
      </div>

      {/* Sections Outline List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-none">
        {filteredSections.map((section, displayIdx) => {
          const actualIndex = sorted.findIndex((s) => s.id === section.id);
          const def = COMPONENT_REGISTRY[section.type as SectionType];
          if (!def) return null;
          const Icon = iconMap[def.icon] || Layers;
          const isSelected = section.id === selectedSectionId;
          const isDragOver = dragOverIndex === actualIndex;

          const subtitlePreview =
            (section.config.title as string) ||
            (section.config.headline as string) ||
            (section.config.heading as string) ||
            (section.config.text as string) ||
            def.category;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, actualIndex)}
              onDragOver={(e) => handleDragOver(e, actualIndex)}
              onDrop={(e) => handleDrop(e, actualIndex)}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onClick={() => onSelectSection(section.id)}
              className={`group relative p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-1 ring-amber-400'
                  : isDragOver
                  ? 'bg-amber-50 border-amber-400'
                  : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-xs text-slate-800'
              } ${!section.visible ? 'opacity-50 italic bg-slate-50' : ''}`}
            >
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-400 cursor-grab shrink-0 mt-0.5" />
                
                <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">{def.label}</span>
                    <span className={`text-3xs font-mono uppercase px-1.5 py-0.5 rounded ${isSelected ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-500'}`}>
                      {section.visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className={`text-2xs truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    {subtitlePreview}
                  </p>
                </div>
              </div>

              {/* Action Toolbar on Hover/Select */}
              <div className={`mt-2 pt-1.5 border-t ${isSelected ? 'border-slate-800' : 'border-slate-100'} flex items-center justify-between opacity-90 group-hover:opacity-100 transition`}>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (actualIndex > 0) onReorder(actualIndex, actualIndex - 1);
                    }}
                    disabled={actualIndex === 0}
                    className={`p-1 rounded hover:bg-slate-200/50 ${isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-400'} disabled:opacity-30`}
                    title="Move Up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (actualIndex < sorted.length - 1) onReorder(actualIndex, actualIndex + 1);
                    }}
                    disabled={actualIndex === sorted.length - 1}
                    className={`p-1 rounded hover:bg-slate-200/50 ${isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-400'} disabled:opacity-30`}
                    title="Move Down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSection(section.id);
                    }}
                    className={`p-1 rounded hover:bg-slate-200/50 ${isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-500'} transition`}
                    title="Duplicate Section"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(section.id);
                    }}
                    className={`p-1 rounded hover:bg-slate-200/50 ${isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-500'} transition`}
                    title={section.visible ? 'Hide Section' : 'Show Section'}
                  >
                    {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-amber-500" />}
                  </button>
                  {def.isDeletable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSection(section.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 transition"
                      title="Delete Section"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
