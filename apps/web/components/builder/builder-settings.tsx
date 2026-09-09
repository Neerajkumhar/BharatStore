'use client';

import React from 'react';
import { COMPONENT_REGISTRY, type SectionType } from '@bharatstore/shared/constants';
import {
  announcementConfigSchema, heroConfigSchema, categoriesConfigSchema,
  featuredProductsConfigSchema, bannerConfigSchema, aboutConfigSchema,
  trustConfigSchema, testimonialsConfigSchema, faqConfigSchema,
  contactConfigSchema, footerConfigSchema, themeConfigSchema,
} from '@bharatstore/shared/schemas';

interface SectionItem {
  id: string;
  type: string;
  config: Record<string, unknown>;
  visible: boolean;
  order: number;
}

interface BuilderSettingsProps {
  section: SectionItem | null;
  theme: Record<string, unknown>;
  onUpdateSection: (id: string, config: Record<string, unknown>) => void;
  onUpdateTheme: (theme: Record<string, unknown>) => void;
  showTheme: boolean;
  onToggleTheme: () => void;
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
      <span className="text-xs text-slate-700">{label}</span>
    </label>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input type="number" value={value || 0} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none" />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 p-0.5 border border-slate-200 rounded cursor-pointer" />
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono" />
    </div>
  );
}

function SectionSettings({ section, onUpdate }: { section: SectionItem; onUpdate: (config: Record<string, unknown>) => void }) {
  const { type, config } = section;

  switch (type) {
    case 'announcement':
      return (
        <div className="space-y-3">
          <FieldGroup label="Text"><TextInput value={config.text as string} onChange={(v) => onUpdate({ ...config, text: v })} /></FieldGroup>
          <FieldGroup label="Link"><TextInput value={config.link as string} onChange={(v) => onUpdate({ ...config, link: v })} placeholder="/products" /></FieldGroup>
          <FieldGroup label="Visible"><Toggle checked={config.visible as boolean} onChange={(v) => onUpdate({ ...config, visible: v })} label="Show announcement bar" /></FieldGroup>
          <FieldGroup label="Background Color"><ColorInput value={config.bgColor as string} onChange={(v) => onUpdate({ ...config, bgColor: v })} /></FieldGroup>
          <FieldGroup label="Text Color"><ColorInput value={config.textColor as string} onChange={(v) => onUpdate({ ...config, textColor: v })} /></FieldGroup>
        </div>
      );
    case 'hero':
      return (
        <div className="space-y-3">
          <FieldGroup label="Title"><TextInput value={config.title as string} onChange={(v) => onUpdate({ ...config, title: v })} /></FieldGroup>
          <FieldGroup label="Subtitle"><TextArea value={config.subtitle as string} onChange={(v) => onUpdate({ ...config, subtitle: v })} rows={2} /></FieldGroup>
          <FieldGroup label="Image URL"><TextInput value={config.imageUrl as string} onChange={(v) => onUpdate({ ...config, imageUrl: v })} placeholder="https://..." /></FieldGroup>
          <FieldGroup label="CTA Text"><TextInput value={config.ctaText as string} onChange={(v) => onUpdate({ ...config, ctaText: v })} /></FieldGroup>
          <FieldGroup label="CTA Link"><TextInput value={config.ctaLink as string} onChange={(v) => onUpdate({ ...config, ctaLink: v })} placeholder="/products" /></FieldGroup>
          <FieldGroup label="Alignment"><SelectInput value={config.alignment as string} onChange={(v) => onUpdate({ ...config, alignment: v })} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} /></FieldGroup>
          <FieldGroup label="Height"><SelectInput value={config.height as string} onChange={(v) => onUpdate({ ...config, height: v })} options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]} /></FieldGroup>
          <FieldGroup label="Background"><ColorInput value={config.backgroundColor as string} onChange={(v) => onUpdate({ ...config, backgroundColor: v })} /></FieldGroup>
          <FieldGroup label="Overlay Opacity"><SelectInput value={(cfg.overlayOpacity as string) || '40'} onChange={(v) => updateConfig({ ...cfg, overlayOpacity: Number(v) })} options={[{ value: '0', label: '0%' }, { value: '30', label: '30%' }, { value: '50', label: '50%' }, { value: '70', label: '70%' }, { value: '90', label: '90%' }]} /></FieldGroup>
        </div>
      );
    case 'categories':
      return (
        <div className="space-y-3">
          <FieldGroup label="Title"><TextInput value={config.title as string} onChange={(v) => onUpdate({ ...config, title: v })} /></FieldGroup>
          <FieldGroup label="Subtitle"><TextInput value={config.subtitle as string} onChange={(v) => onUpdate({ ...config, subtitle: v })} /></FieldGroup>
          <FieldGroup label="Columns"><NumberInput value={config.columns as number} onChange={(v) => onUpdate({ ...config, columns: v })} min={2} max={6} /></FieldGroup>
          <FieldGroup label="Limit"><NumberInput value={config.limit as number} onChange={(v) => onUpdate({ ...config, limit: v })} min={1} max={20} /></FieldGroup>
          <FieldGroup label="Show Product Count"><Toggle checked={config.showProductCount as boolean} onChange={(v) => onUpdate({ ...config, showProductCount: v })} label="Show count" /></FieldGroup>
        </div>
      );
    case 'featured-products':
      return (
        <div className="space-y-3">
          <FieldGroup label="Title"><TextInput value={config.title as string} onChange={(v) => onUpdate({ ...config, title: v })} /></FieldGroup>
          <FieldGroup label="Subtitle"><TextInput value={config.subtitle as string} onChange={(v) => onUpdate({ ...config, subtitle: v })} /></FieldGroup>
          <FieldGroup label="Selection"><SelectInput value={config.selectionMode as string} onChange={(v) => onUpdate({ ...config, selectionMode: v })} options={[{ value: 'newest', label: 'Newest' }, { value: 'featured', label: 'Featured' }, { value: 'category', label: 'By Category' }, { value: 'manual', label: 'Manual' }]} /></FieldGroup>
          <FieldGroup label="Number of Products"><NumberInput value={config.limit as number} onChange={(v) => onUpdate({ ...config, limit: v })} min={1} max={20} /></FieldGroup>
          <FieldGroup label="Columns"><NumberInput value={config.columns as number} onChange={(v) => onUpdate({ ...config, columns: v })} min={2} max={4} /></FieldGroup>
        </div>
      );
    case 'banner':
      return (
        <div className="space-y-3">
          <FieldGroup label="Heading"><TextInput value={config.heading as string} onChange={(v) => onUpdate({ ...config, heading: v })} /></FieldGroup>
          <FieldGroup label="Description"><TextArea value={config.description as string} onChange={(v) => onUpdate({ ...config, description: v })} rows={2} /></FieldGroup>
          <FieldGroup label="Image URL"><TextInput value={config.imageUrl as string} onChange={(v) => onUpdate({ ...config, imageUrl: v })} placeholder="https://..." /></FieldGroup>
          <FieldGroup label="Button Text"><TextInput value={config.ctaText as string} onChange={(v) => onUpdate({ ...config, ctaText: v })} /></FieldGroup>
          <FieldGroup label="Button Link"><TextInput value={config.ctaLink as string} onChange={(v) => onUpdate({ ...config, ctaLink: v })} /></FieldGroup>
          <FieldGroup label="Background"><ColorInput value={config.bgColor as string} onChange={(v) => onUpdate({ ...config, bgColor: v })} /></FieldGroup>
          <FieldGroup label="Text Color"><ColorInput value={config.textColor as string} onChange={(v) => onUpdate({ ...config, textColor: v })} /></FieldGroup>
          <FieldGroup label="Layout"><SelectInput value={config.layout as string} onChange={(v) => onUpdate({ ...config, layout: v })} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} /></FieldGroup>
        </div>
      );
    case 'about':
      return (
        <div className="space-y-3">
          <FieldGroup label="Title"><TextInput value={config.title as string} onChange={(v) => onUpdate({ ...config, title: v })} /></FieldGroup>
          <FieldGroup label="Description"><TextArea value={config.description as string} onChange={(v) => onUpdate({ ...config, description: v })} rows={3} /></FieldGroup>
          <FieldGroup label="Image URL"><TextInput value={config.imageUrl as string} onChange={(v) => onUpdate({ ...config, imageUrl: v })} placeholder="https://..." /></FieldGroup>
          <FieldGroup label="Layout"><SelectInput value={config.layout as string} onChange={(v) => onUpdate({ ...config, layout: v })} options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'center', label: 'Center' }]} /></FieldGroup>
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-3">
          <FieldGroup label="Title"><TextInput value={config.title as string} onChange={(v) => onUpdate({ ...config, title: v })} /></FieldGroup>
          <div className="space-y-2">
            <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">Questions</label>
            {(config.items as any[] || []).map((item: any, i: number) => (
              <div key={i} className="bg-slate-50 rounded-lg p-2 space-y-1.5">
                <TextInput value={item.question} onChange={(v) => {
                  const items = [...(config.items as any[] || [])];
                  items[i] = { ...items[i], question: v };
                  onUpdate({ ...config, items });
                }} placeholder="Question" />
                <TextArea value={item.answer} onChange={(v) => {
                  const items = [...(config.items as any[] || [])];
                  items[i] = { ...items[i], answer: v };
                  onUpdate({ ...config, items });
                }} rows={2} placeholder="Answer" />
                <button onClick={() => {
                  const items = (config.items as any[] || []).filter((_: any, idx: number) => idx !== i);
                  onUpdate({ ...config, items });
                }} className="text-2xs text-red-500 hover:underline">Remove</button>
              </div>
            ))}
            <button onClick={() => {
              const items = [...(config.items as any[] || []), { question: '', answer: '' }];
              onUpdate({ ...config, items });
            }} className="text-2xs text-amber-600 font-bold hover:underline">+ Add Question</button>
          </div>
        </div>
      );
    case 'testimonials':
      return (
        <div className="space-y-3">
          <FieldGroup label="Title"><TextInput value={config.title as string} onChange={(v) => onUpdate({ ...config, title: v })} /></FieldGroup>
          <div className="space-y-2">
            <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">Testimonials</label>
            {(config.testimonials as any[] || []).map((t: any, i: number) => (
              <div key={i} className="bg-slate-50 rounded-lg p-2 space-y-1.5">
                <TextInput value={t.name} onChange={(v) => {
                  const testimonials = [...(config.testimonials as any[] || [])];
                  testimonials[i] = { ...testimonials[i], name: v };
                  onUpdate({ ...config, testimonials });
                }} placeholder="Name" />
                <TextArea value={t.text} onChange={(v) => {
                  const testimonials = [...(config.testimonials as any[] || [])];
                  testimonials[i] = { ...testimonials[i], text: v };
                  onUpdate({ ...config, testimonials });
                }} rows={2} placeholder="Review text" />
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-slate-400">Rating:</span>
                  <NumberInput value={t.rating} onChange={(v) => {
                    const testimonials = [...(config.testimonials as any[] || [])];
                    testimonials[i] = { ...testimonials[i], rating: v };
                    onUpdate({ ...config, testimonials });
                  }} min={1} max={5} />
                </div>
                <button onClick={() => {
                  const testimonials = (config.testimonials as any[] || []).filter((_: any, idx: number) => idx !== i);
                  onUpdate({ ...config, testimonials });
                }} className="text-2xs text-red-500 hover:underline">Remove</button>
              </div>
            ))}
            <button onClick={() => {
              const testimonials = [...(config.testimonials as any[] || []), { name: '', text: '', rating: 5 }];
              onUpdate({ ...config, testimonials });
            }} className="text-2xs text-amber-600 font-bold hover:underline">+ Add Testimonial</button>
          </div>
        </div>
      );
    default:
      return <p className="text-xs text-slate-400 italic">No editable settings for this section.</p>;
  }
}

function ThemeSettings({ theme, onUpdate }: { theme: Record<string, unknown>; onUpdate: (t: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Brand Colors</h4>
      <FieldGroup label="Primary Color"><ColorInput value={theme.primaryColor as string || '#0f172a'} onChange={(v) => onUpdate({ ...theme, primaryColor: v })} /></FieldGroup>
      <FieldGroup label="Accent Color"><ColorInput value={theme.accentColor as string || '#d97706'} onChange={(v) => onUpdate({ ...theme, accentColor: v })} /></FieldGroup>
      <FieldGroup label="Background"><ColorInput value={theme.backgroundColor as string || '#f8fafc'} onChange={(v) => onUpdate({ ...theme, backgroundColor: v })} /></FieldGroup>
      <FieldGroup label="Text Color"><ColorInput value={theme.textColor as string || '#0f172a'} onChange={(v) => onUpdate({ ...theme, textColor: v })} /></FieldGroup>
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pt-2">Typography</h4>
      <FieldGroup label="Font Family"><SelectInput value={theme.fontFamily as string || 'inter'} onChange={(v) => onUpdate({ ...theme, fontFamily: v })} options={[{ value: 'inter', label: 'Inter' }, { value: 'plus-jakarta', label: 'Plus Jakarta Sans' }, { value: 'poppins', label: 'Poppins' }, { value: 'nunito', label: 'Nunito' }, { value: 'system', label: 'System' }]} /></FieldGroup>
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pt-2">Appearance</h4>
      <FieldGroup label="Border Radius"><SelectInput value={theme.borderRadius as string || 'lg'} onChange={(v) => onUpdate({ ...theme, borderRadius: v })} options={[{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }]} /></FieldGroup>
      <FieldGroup label="Button Style"><SelectInput value={theme.buttonStyle as string || 'rounded'} onChange={(v) => onUpdate({ ...theme, buttonStyle: v })} options={[{ value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' }, { value: 'square', label: 'Square' }]} /></FieldGroup>
      <FieldGroup label="Card Style"><SelectInput value={theme.cardStyle as string || 'bordered'} onChange={(v) => onUpdate({ ...theme, cardStyle: v })} options={[{ value: 'flat', label: 'Flat' }, { value: 'shadow', label: 'Shadow' }, { value: 'bordered', label: 'Bordered' }]} /></FieldGroup>
    </div>
  );
}

export function BuilderSettings({ section, theme, onUpdateSection, onUpdateTheme, showTheme, onToggleTheme }: BuilderSettingsProps) {
  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 h-full overflow-hidden">
      <div className="p-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition ${!showTheme ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Section
          </button>
          <button
            onClick={onToggleTheme}
            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition ${showTheme ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Theme
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {showTheme ? (
          <ThemeSettings theme={theme} onUpdate={onUpdateTheme} />
        ) : section ? (
          <div className="space-y-1">
            <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {COMPONENT_REGISTRY[section.type as SectionType]?.label || section.type}
            </div>
            <SectionSettings section={section} onUpdate={(config) => onUpdateSection(section.id, config)} />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">Select a section to edit its settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
