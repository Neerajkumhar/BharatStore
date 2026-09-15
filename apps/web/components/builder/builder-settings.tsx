'use client';

import React, { useState } from 'react';
import { COMPONENT_REGISTRY, type SectionType } from '@bharatstore/shared/constants';
import { Plus, Trash2 } from 'lucide-react';

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
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-slate-900"
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none bg-white text-slate-900"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
      <span className="text-xs text-slate-700 font-medium">{label}</span>
    </label>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-slate-900">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input type="number" value={value ?? 0} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-slate-900" />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 p-0.5 border border-slate-200 rounded cursor-pointer bg-white" />
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-white text-slate-900" />
    </div>
  );
}

function ImageInput({ value, onChange, placeholder = 'https://...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [showPicker, setShowPicker] = useState(false);

  const sampleImages = [
    { label: 'Varanasi Silk Saree', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Banarasi Lehengas', url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80' },
    { label: 'Traditional Jewellery', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Handloom Weaving', url: 'https://images.unsplash.com/photo-1606744888344-49423b812d0d?auto=format&fit=crop&w=800&q=80' },
    { label: 'Ethnic Kurta Set', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Minimalist Interior', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {value ? (
          <img src={value} alt="Preview" className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0" />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs shrink-0">
            🖼️
          </div>
        )}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-slate-900"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="text-2xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded hover:bg-amber-100 transition"
      >
        <span>📷 {showPicker ? 'Close Sample Gallery' : 'Pick Sample Store Image'}</span>
      </button>

      {showPicker && (
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
          <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">Click any image to select:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {sampleImages.map((img) => (
              <button
                key={img.url}
                type="button"
                onClick={() => {
                  onChange(img.url);
                  setShowPicker(false);
                }}
                className={`group relative rounded-lg overflow-hidden border transition text-left ${
                  value === img.url ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={img.url} alt={img.label} className="h-14 w-full object-cover group-hover:scale-105 transition" />
                <div className="p-1 bg-slate-900/80 backdrop-blur-xs text-white text-3xs font-semibold truncate">
                  {img.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StringListInput({ label, items, onChange }: { label: string; items: string[]; onChange: (newItems: string[]) => void }) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onChange([...items, newItem.trim()]);
    setNewItem('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="space-y-1.5">
        {(items || []).map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <input
              type="text"
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[idx] = e.target.value;
                onChange(next);
              }}
              className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-900"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="p-1 text-slate-400 hover:text-red-500 transition"
              title="Remove item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          placeholder="Add item..."
          className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-900"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-2xs font-bold transition flex items-center gap-1 shrink-0"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
    </div>
  );
}

function ObjectListInput({
  label,
  items,
  onChange,
  defaultNewItem,
  fields,
}: {
  label: string;
  items: any[];
  onChange: (newItems: any[]) => void;
  defaultNewItem: Record<string, any>;
  fields: Array<{ key: string; label: string; type?: 'text' | 'textarea' | 'image' | 'color' | 'number' }>;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="space-y-2">
        {(items || []).map((item, idx) => (
          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2 relative group">
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition opacity-80 group-hover:opacity-100"
              title="Delete item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <div className="pr-6 space-y-2">
              {fields.map((f) => {
                const val = item?.[f.key];
                if (f.type === 'textarea') {
                  return (
                    <FieldGroup key={f.key} label={f.label}>
                      <TextArea
                        value={val}
                        onChange={(v) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], [f.key]: v };
                          onChange(next);
                        }}
                        rows={2}
                      />
                    </FieldGroup>
                  );
                }
                if (f.type === 'image') {
                  return (
                    <FieldGroup key={f.key} label={f.label}>
                      <ImageInput
                        value={val}
                        onChange={(v) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], [f.key]: v };
                          onChange(next);
                        }}
                      />
                    </FieldGroup>
                  );
                }
                if (f.type === 'color') {
                  return (
                    <FieldGroup key={f.key} label={f.label}>
                      <ColorInput
                        value={val}
                        onChange={(v) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], [f.key]: v };
                          onChange(next);
                        }}
                      />
                    </FieldGroup>
                  );
                }
                if (f.type === 'number') {
                  return (
                    <FieldGroup key={f.key} label={f.label}>
                      <NumberInput
                        value={val}
                        onChange={(v) => {
                          const next = [...items];
                          next[idx] = { ...next[idx], [f.key]: v };
                          onChange(next);
                        }}
                      />
                    </FieldGroup>
                  );
                }
                return (
                  <FieldGroup key={f.key} label={f.label}>
                    <TextInput
                      value={val}
                      onChange={(v) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], [f.key]: v };
                        onChange(next);
                      }}
                    />
                  </FieldGroup>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...(items || []), { ...defaultNewItem }])}
        className="w-full py-1.5 px-3 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border border-amber-200"
      >
        <Plus className="h-3.5 w-3.5" /> Add {label.replace(/s$/i, '')}
      </button>
    </div>
  );
}

function SectionSettings({ section, onUpdate }: { section: SectionItem; onUpdate: (config: Record<string, unknown>) => void }) {
  const { type, config } = section;
  const def = COMPONENT_REGISTRY[type as SectionType];

  // Merge defaultConfig with saved config so all editable fields are accessible
  const merged = { ...(def?.defaultConfig || {}), ...config };

  const handledKeys = new Set<string>();

  const updateField = (key: string, val: unknown) => {
    onUpdate({ ...merged, [key]: val });
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Section info badge */}
      {def && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900">{def.label}</span>
            <span className="text-3xs font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">{def.category}</span>
          </div>
          <p className="text-2xs text-slate-500 leading-snug">{def.description}</p>
        </div>
      )}

      {/* 1. Primary Text & Content */}
      <div className="space-y-3">
        {'title' in merged && (
          (handledKeys.add('title'),
          <FieldGroup label="Title">
            <TextInput value={merged.title as string} onChange={(v) => updateField('title', v)} />
          </FieldGroup>)
        )}
        {'heading' in merged && (
          (handledKeys.add('heading'),
          <FieldGroup label="Heading">
            <TextInput value={merged.heading as string} onChange={(v) => updateField('heading', v)} />
          </FieldGroup>)
        )}
        {'headline' in merged && (
          (handledKeys.add('headline'),
          <FieldGroup label="Headline">
            <TextInput value={merged.headline as string} onChange={(v) => updateField('headline', v)} />
          </FieldGroup>)
        )}
        {'leftHeading' in merged && (
          (handledKeys.add('leftHeading'),
          <FieldGroup label="Left Heading">
            <TextInput value={merged.leftHeading as string} onChange={(v) => updateField('leftHeading', v)} />
          </FieldGroup>)
        )}
        {'rightHeading' in merged && (
          (handledKeys.add('rightHeading'),
          <FieldGroup label="Right Heading">
            <TextInput value={merged.rightHeading as string} onChange={(v) => updateField('rightHeading', v)} />
          </FieldGroup>)
        )}
        {'seasonTag' in merged && (
          (handledKeys.add('seasonTag'),
          <FieldGroup label="Season Tag / Badge">
            <TextInput value={merged.seasonTag as string} onChange={(v) => updateField('seasonTag', v)} />
          </FieldGroup>)
        )}
        {'badge' in merged && (
          (handledKeys.add('badge'),
          <FieldGroup label="Badge Tag">
            <TextInput value={merged.badge as string} onChange={(v) => updateField('badge', v)} />
          </FieldGroup>)
        )}

        {'subtitle' in merged && (
          (handledKeys.add('subtitle'),
          <FieldGroup label="Subtitle">
            <TextArea value={merged.subtitle as string} onChange={(v) => updateField('subtitle', v)} rows={2} />
          </FieldGroup>)
        )}
        {'subheadline' in merged && (
          (handledKeys.add('subheadline'),
          <FieldGroup label="Sub-headline">
            <TextArea value={merged.subheadline as string} onChange={(v) => updateField('subheadline', v)} rows={2} />
          </FieldGroup>)
        )}
        {'description' in merged && (
          (handledKeys.add('description'),
          <FieldGroup label="Description">
            <TextArea value={merged.description as string} onChange={(v) => updateField('description', v)} rows={3} />
          </FieldGroup>)
        )}
        {'story' in merged && (
          (handledKeys.add('story'),
          <FieldGroup label="Story / Narrative">
            <TextArea value={merged.story as string} onChange={(v) => updateField('story', v)} rows={3} />
          </FieldGroup>)
        )}
        {'quote' in merged && (
          (handledKeys.add('quote'),
          <FieldGroup label="Quote Text">
            <TextArea value={merged.quote as string} onChange={(v) => updateField('quote', v)} rows={2} />
          </FieldGroup>)
        )}
        {'author' in merged && (
          (handledKeys.add('author'),
          <FieldGroup label="Author / Speaker">
            <TextInput value={merged.author as string} onChange={(v) => updateField('author', v)} />
          </FieldGroup>)
        )}
        {'leftSub' in merged && (
          (handledKeys.add('leftSub'),
          <FieldGroup label="Left Subtitle">
            <TextInput value={merged.leftSub as string} onChange={(v) => updateField('leftSub', v)} />
          </FieldGroup>)
        )}
        {'rightSub' in merged && (
          (handledKeys.add('rightSub'),
          <FieldGroup label="Right Subtitle">
            <TextInput value={merged.rightSub as string} onChange={(v) => updateField('rightSub', v)} />
          </FieldGroup>)
        )}
        {'accentText' in merged && (
          (handledKeys.add('accentText'),
          <FieldGroup label="Accent Badge Text">
            <TextInput value={merged.accentText as string} onChange={(v) => updateField('accentText', v)} />
          </FieldGroup>)
        )}
        {'text' in merged && typeof merged.text === 'string' && (
          (handledKeys.add('text'),
          <FieldGroup label="Text">
            <TextInput value={merged.text as string} onChange={(v) => updateField('text', v)} />
          </FieldGroup>)
        )}
        {'price' in merged && (
          (handledKeys.add('price'),
          <FieldGroup label="Price (₹)">
            <TextInput value={merged.price as string} onChange={(v) => updateField('price', v)} />
          </FieldGroup>)
        )}
        {'mrp' in merged && (
          (handledKeys.add('mrp'),
          <FieldGroup label="MRP / Original Price (₹)">
            <TextInput value={merged.mrp as string} onChange={(v) => updateField('mrp', v)} />
          </FieldGroup>)
        )}
        {'comparePrice' in merged && (
          (handledKeys.add('comparePrice'),
          <FieldGroup label="Compare Price (₹)">
            <TextInput value={merged.comparePrice as string} onChange={(v) => updateField('comparePrice', v)} />
          </FieldGroup>)
        )}
        {'rating' in merged && (
          (handledKeys.add('rating'),
          <FieldGroup label="Rating (e.g. 4.9)">
            <TextInput value={String(merged.rating)} onChange={(v) => updateField('rating', v)} />
          </FieldGroup>)
        )}
        {'reviewCount' in merged && (
          (handledKeys.add('reviewCount'),
          <FieldGroup label="Total Reviews Count">
            <TextInput value={merged.reviewCount as string} onChange={(v) => updateField('reviewCount', v)} />
          </FieldGroup>)
        )}
        {'targetDate' in merged && (
          (handledKeys.add('targetDate'),
          <FieldGroup label="Timer Target Date/Time">
            <TextInput value={merged.targetDate as string} onChange={(v) => updateField('targetDate', v)} placeholder="YYYY-MM-DDTHH:mm:ssZ" />
          </FieldGroup>)
        )}
      </div>

      {/* 2. Call to Action (CTA) Buttons & Links */}
      {('ctaText' in merged || 'ctaLink' in merged || 'leftCta' in merged || 'rightCta' in merged || 'secondaryCtaText' in merged || 'buttonText' in merged || 'link' in merged) && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h5 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Buttons & Navigation Links</h5>
          {'ctaText' in merged && (
            (handledKeys.add('ctaText'),
            <FieldGroup label="Primary Button Text">
              <TextInput value={merged.ctaText as string} onChange={(v) => updateField('ctaText', v)} />
            </FieldGroup>)
          )}
          {'ctaLink' in merged && (
            (handledKeys.add('ctaLink'),
            <FieldGroup label="Primary Button Link">
              <TextInput value={merged.ctaLink as string} onChange={(v) => updateField('ctaLink', v)} placeholder="/products" />
            </FieldGroup>)
          )}
          {'secondaryCtaText' in merged && (
            (handledKeys.add('secondaryCtaText'),
            <FieldGroup label="Secondary Button Text">
              <TextInput value={merged.secondaryCtaText as string} onChange={(v) => updateField('secondaryCtaText', v)} />
            </FieldGroup>)
          )}
          {'secondaryCtaLink' in merged && (
            (handledKeys.add('secondaryCtaLink'),
            <FieldGroup label="Secondary Button Link">
              <TextInput value={merged.secondaryCtaLink as string} onChange={(v) => updateField('secondaryCtaLink', v)} placeholder="/categories" />
            </FieldGroup>)
          )}
          {'leftCta' in merged && (
            (handledKeys.add('leftCta'),
            <FieldGroup label="Left Button Text">
              <TextInput value={merged.leftCta as string} onChange={(v) => updateField('leftCta', v)} />
            </FieldGroup>)
          )}
          {'rightCta' in merged && (
            (handledKeys.add('rightCta'),
            <FieldGroup label="Right Button Text">
              <TextInput value={merged.rightCta as string} onChange={(v) => updateField('rightCta', v)} />
            </FieldGroup>)
          )}
          {'buttonText' in merged && (
            (handledKeys.add('buttonText'),
            <FieldGroup label="Subscribe / Action Button Text">
              <TextInput value={merged.buttonText as string} onChange={(v) => updateField('buttonText', v)} />
            </FieldGroup>)
          )}
          {'link' in merged && typeof merged.link === 'string' && (
            (handledKeys.add('link'),
            <FieldGroup label="Link Target">
              <TextInput value={merged.link as string} onChange={(v) => updateField('link', v)} placeholder="/products" />
            </FieldGroup>)
          )}
          {'placeholder' in merged && (
            (handledKeys.add('placeholder'),
            <FieldGroup label="Input Placeholder">
              <TextInput value={merged.placeholder as string} onChange={(v) => updateField('placeholder', v)} />
            </FieldGroup>)
          )}
        </div>
      )}

      {/* 3. Media & Images */}
      {('imageUrl' in merged || 'promoImage' in merged || 'bgImage' in merged || 'leftImage' in merged || 'rightImage' in merged) && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h5 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Media & Images</h5>
          {'imageUrl' in merged && (
            (handledKeys.add('imageUrl'),
            <FieldGroup label="Section Image">
              <ImageInput value={merged.imageUrl as string} onChange={(v) => updateField('imageUrl', v)} />
            </FieldGroup>)
          )}
          {'promoImage' in merged && (
            (handledKeys.add('promoImage'),
            <FieldGroup label="Promotional Image">
              <ImageInput value={merged.promoImage as string} onChange={(v) => updateField('promoImage', v)} />
            </FieldGroup>)
          )}
          {'bgImage' in merged && (
            (handledKeys.add('bgImage'),
            <FieldGroup label="Background Image">
              <ImageInput value={merged.bgImage as string} onChange={(v) => updateField('bgImage', v)} />
            </FieldGroup>)
          )}
        </div>
      )}

      {/* 4. Layout & Grid Settings */}
      {('columns' in merged || 'limit' in merged || 'alignment' in merged || 'layout' in merged || 'selectionMode' in merged || 'cardVariant' in merged || 'height' in merged || 'overlayOpacity' in merged || 'animation' in merged || 'speed' in merged) && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h5 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Layout & Structure</h5>
          {'columns' in merged && (
            (handledKeys.add('columns'),
            <FieldGroup label="Grid Columns">
              <NumberInput value={Number(merged.columns)} onChange={(v) => updateField('columns', v)} min={1} max={6} />
            </FieldGroup>)
          )}
          {'limit' in merged && (
            (handledKeys.add('limit'),
            <FieldGroup label="Max Display Items">
              <NumberInput value={Number(merged.limit)} onChange={(v) => updateField('limit', v)} min={1} max={24} />
            </FieldGroup>)
          )}
          {'alignment' in merged && (
            (handledKeys.add('alignment'),
            <FieldGroup label="Text Alignment">
              <SelectInput
                value={merged.alignment as string}
                onChange={(v) => updateField('alignment', v)}
                options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]}
              />
            </FieldGroup>)
          )}
          {'layout' in merged && typeof merged.layout === 'string' && (
            (handledKeys.add('layout'),
            <FieldGroup label="Layout Style">
              <SelectInput
                value={merged.layout as string}
                onChange={(v) => updateField('layout', v)}
                options={[{ value: 'grid', label: 'Grid' }, { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }, { value: 'left-image', label: 'Left Image' }]}
              />
            </FieldGroup>)
          )}
          {'height' in merged && (
            (handledKeys.add('height'),
            <FieldGroup label="Section Height">
              <SelectInput
                value={merged.height as string}
                onChange={(v) => updateField('height', v)}
                options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]}
              />
            </FieldGroup>)
          )}
          {'selectionMode' in merged && (
            (handledKeys.add('selectionMode'),
            <FieldGroup label="Product Selection Mode">
              <SelectInput
                value={merged.selectionMode as string}
                onChange={(v) => updateField('selectionMode', v)}
                options={[{ value: 'newest', label: 'Newest Products' }, { value: 'featured', label: 'Featured Products' }, { value: 'category', label: 'By Category' }, { value: 'manual', label: 'Manual Selection' }]}
              />
            </FieldGroup>)
          )}
          {'cardVariant' in merged && (
            (handledKeys.add('cardVariant'),
            <FieldGroup label="Card Style">
              <SelectInput
                value={merged.cardVariant as string}
                onChange={(v) => updateField('cardVariant', v)}
                options={[{ value: 'classic', label: 'Classic' }, { value: 'compact', label: 'Compact' }, { value: 'deal', label: 'Deal Badge' }, { value: 'editorial', label: 'Editorial' }]}
              />
            </FieldGroup>)
          )}
          {'overlayOpacity' in merged && (
            (handledKeys.add('overlayOpacity'),
            <FieldGroup label="Overlay Dimming Opacity">
              <SelectInput
                value={String(merged.overlayOpacity)}
                onChange={(v) => updateField('overlayOpacity', Number(v))}
                options={[{ value: '0', label: '0%' }, { value: '30', label: '30%' }, { value: '40', label: '40%' }, { value: '50', label: '50%' }, { value: '70', label: '70%' }, { value: '90', label: '90%' }]}
              />
            </FieldGroup>)
          )}
          {'animation' in merged && (
            (handledKeys.add('animation'),
            <FieldGroup label="Scroll Entrance Animation">
              <SelectInput
                value={merged.animation as string}
                onChange={(v) => updateField('animation', v)}
                options={[{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade In' }, { value: 'fade-up', label: 'Fade Up' }, { value: 'slide-up', label: 'Slide Up' }, { value: 'scale', label: 'Scale Up' }]}
              />
            </FieldGroup>)
          )}
          {'speed' in merged && (
            (handledKeys.add('speed'),
            <FieldGroup label="Marquee Speed">
              <SelectInput
                value={merged.speed as string}
                onChange={(v) => updateField('speed', v)}
                options={[{ value: 'slow', label: 'Slow' }, { value: 'normal', label: 'Normal' }, { value: 'fast', label: 'Fast' }]}
              />
            </FieldGroup>)
          )}
        </div>
      )}

      {/* 5. Color Customization */}
      {('bgColor' in merged || 'backgroundColor' in merged || 'textColor' in merged || 'accentColor' in merged) && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h5 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Colors & Appearance</h5>
          {('bgColor' in merged || 'backgroundColor' in merged) && (
            (handledKeys.add('bgColor'), handledKeys.add('backgroundColor'),
            <FieldGroup label="Background Color">
              <ColorInput
                value={(merged.bgColor || merged.backgroundColor || '#ffffff') as string}
                onChange={(v) => {
                  const update: Record<string, unknown> = {};
                  if ('bgColor' in merged) update.bgColor = v;
                  if ('backgroundColor' in merged) update.backgroundColor = v;
                  onUpdate({ ...merged, ...update });
                }}
              />
            </FieldGroup>)
          )}
          {'textColor' in merged && (
            (handledKeys.add('textColor'),
            <FieldGroup label="Text Color">
              <ColorInput value={merged.textColor as string} onChange={(v) => updateField('textColor', v)} />
            </FieldGroup>)
          )}
          {'accentColor' in merged && (
            (handledKeys.add('accentColor'),
            <FieldGroup label="Accent Color">
              <ColorInput value={merged.accentColor as string} onChange={(v) => updateField('accentColor', v)} />
            </FieldGroup>)
          )}
        </div>
      )}

      {/* 6. Feature Toggles */}
      {('visible' in merged || 'marquee' in merged || 'dismissible' in merged || 'transparent' in merged || 'showSearch' in merged || 'showCart' in merged || 'showAccount' in merged || 'showProductCount' in merged || 'showLabels' in merged || 'showFilters' in merged || 'showSort' in merged || 'autoplay' in merged || 'autoPlay' in merged || 'showPhone' in merged || 'showEmail' in merged || 'showAddress' in merged || 'showHours' in merged || 'showValueProps' in merged || 'showSocialLinks' in merged || 'showCopyright' in merged) && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h5 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Display Features</h5>
          {'visible' in merged && typeof merged.visible === 'boolean' && (
            (handledKeys.add('visible'),
            <Toggle checked={merged.visible as boolean} onChange={(v) => updateField('visible', v)} label="Section Visible" />)
          )}
          {'marquee' in merged && (
            (handledKeys.add('marquee'),
            <Toggle checked={merged.marquee as boolean} onChange={(v) => updateField('marquee', v)} label="Enable Continuous Marquee" />)
          )}
          {'dismissible' in merged && (
            (handledKeys.add('dismissible'),
            <Toggle checked={merged.dismissible as boolean} onChange={(v) => updateField('dismissible', v)} label="Allow User Dismiss" />)
          )}
          {'transparent' in merged && (
            (handledKeys.add('transparent'),
            <Toggle checked={merged.transparent as boolean} onChange={(v) => updateField('transparent', v)} label="Transparent Header Background" />)
          )}
          {'showSearch' in merged && (
            (handledKeys.add('showSearch'),
            <Toggle checked={merged.showSearch as boolean} onChange={(v) => updateField('showSearch', v)} label="Show Search Bar" />)
          )}
          {'showCart' in merged && (
            (handledKeys.add('showCart'),
            <Toggle checked={merged.showCart as boolean} onChange={(v) => updateField('showCart', v)} label="Show Shopping Cart Icon" />)
          )}
          {'showAccount' in merged && (
            (handledKeys.add('showAccount'),
            <Toggle checked={merged.showAccount as boolean} onChange={(v) => updateField('showAccount', v)} label="Show Customer Account Icon" />)
          )}
          {'showProductCount' in merged && (
            (handledKeys.add('showProductCount'),
            <Toggle checked={merged.showProductCount as boolean} onChange={(v) => updateField('showProductCount', v)} label="Show Category Product Count" />)
          )}
          {'showLabels' in merged && (
            (handledKeys.add('showLabels'),
            <Toggle checked={merged.showLabels as boolean} onChange={(v) => updateField('showLabels', v)} label="Show Category Name Labels" />)
          )}
          {'showFilters' in merged && (
            (handledKeys.add('showFilters'),
            <Toggle checked={merged.showFilters as boolean} onChange={(v) => updateField('showFilters', v)} label="Show Category Filter Buttons" />)
          )}
          {'showSort' in merged && (
            (handledKeys.add('showSort'),
            <Toggle checked={merged.showSort as boolean} onChange={(v) => updateField('showSort', v)} label="Show Price/Sort Dropdown" />)
          )}
          {('autoplay' in merged || 'autoPlay' in merged) && (
            (handledKeys.add('autoplay'), handledKeys.add('autoPlay'),
            <Toggle checked={Boolean(merged.autoplay ?? merged.autoPlay)} onChange={(v) => updateField('autoplay', v)} label="Auto-rotate Carousel Slides" />)
          )}
          {'showPhone' in merged && (
            (handledKeys.add('showPhone'),
            <Toggle checked={merged.showPhone as boolean} onChange={(v) => updateField('showPhone', v)} label="Show Phone Contact" />)
          )}
          {'showEmail' in merged && (
            (handledKeys.add('showEmail'),
            <Toggle checked={merged.showEmail as boolean} onChange={(v) => updateField('showEmail', v)} label="Show Email Support" />)
          )}
          {'showAddress' in merged && (
            (handledKeys.add('showAddress'),
            <Toggle checked={merged.showAddress as boolean} onChange={(v) => updateField('showAddress', v)} label="Show Store Address" />)
          )}
          {'showHours' in merged && (
            (handledKeys.add('showHours'),
            <Toggle checked={merged.showHours as boolean} onChange={(v) => updateField('showHours', v)} label="Show Business Hours" />)
          )}
          {'showValueProps' in merged && (
            (handledKeys.add('showValueProps'),
            <Toggle checked={merged.showValueProps as boolean} onChange={(v) => updateField('showValueProps', v)} label="Show Value Proposition Badges" />)
          )}
          {'showSocialLinks' in merged && (
            (handledKeys.add('showSocialLinks'),
            <Toggle checked={merged.showSocialLinks as boolean} onChange={(v) => updateField('showSocialLinks', v)} label="Show Social Media Icons" />)
          )}
          {'showCopyright' in merged && (
            (handledKeys.add('showCopyright'),
            <Toggle checked={merged.showCopyright as boolean} onChange={(v) => updateField('showCopyright', v)} label="Show Store Copyright Bar" />)
          )}
        </div>
      )}

      {/* 7. Collections & Item Lists */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        {'looks' in merged && Array.isArray(merged.looks) && (
          (handledKeys.add('looks'),
          <ObjectListInput
            label="Lookbook Styled Edits"
            items={merged.looks as any[]}
            onChange={(newLooks) => updateField('looks', newLooks)}
            defaultNewItem={{ title: 'New Look', tag: 'Trend Edit', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' }}
            fields={[
              { key: 'title', label: 'Look Title' },
              { key: 'tag', label: 'Tag (e.g. Festive Edit)' },
              { key: 'image', label: 'Look Image', type: 'image' },
            ]}
          />)
        )}

        {'items' in merged && Array.isArray(merged.items) && (
          (handledKeys.add('items'),
          typeof (merged.items as any[])[0] === 'string' || (merged.items as any[]).length === 0 ? (
            <StringListInput
              label="List Items"
              items={merged.items as string[]}
              onChange={(newItems) => updateField('items', newItems)}
            />
          ) : (
            <ObjectListInput
              label="List Items"
              items={merged.items as any[]}
              onChange={(newItems) => updateField('items', newItems)}
              defaultNewItem={
                'question' in ((merged.items as any[])[0] || {})
                  ? { question: '', answer: '' }
                  : 'code' in ((merged.items as any[])[0] || {})
                  ? { code: 'NEW10', discount: '10% OFF', detail: 'On all items' }
                  : 'step' in ((merged.items as any[])[0] || {})
                  ? { step: '01', title: 'New Step', desc: 'Description' }
                  : { title: 'New Item', desc: 'Description' }
              }
              fields={
                'question' in ((merged.items as any[])[0] || {})
                  ? [{ key: 'question', label: 'Question' }, { key: 'answer', label: 'Answer', type: 'textarea' }]
                  : 'code' in ((merged.items as any[])[0] || {})
                  ? [{ key: 'code', label: 'Coupon Code' }, { key: 'discount', label: 'Discount Tag' }, { key: 'detail', label: 'Offer Detail' }]
                  : 'step' in ((merged.items as any[])[0] || {})
                  ? [{ key: 'step', label: 'Step #' }, { key: 'title', label: 'Title' }, { key: 'desc', label: 'Description', type: 'textarea' }]
                  : [{ key: 'title', label: 'Title' }, { key: 'desc', label: 'Description', type: 'textarea' }]
              }
            />
          ))
        )}

        {'testimonials' in merged && Array.isArray(merged.testimonials) && (
          (handledKeys.add('testimonials'),
          <ObjectListInput
            label="Testimonials"
            items={merged.testimonials as any[]}
            onChange={(newTestimonials) => updateField('testimonials', newTestimonials)}
            defaultNewItem={{ name: 'Happy Shopper', text: 'Great products and fast shipping!', rating: 5 }}
            fields={[
              { key: 'name', label: 'Customer Name' },
              { key: 'text', label: 'Review Text', type: 'textarea' },
              { key: 'rating', label: 'Star Rating (1-5)', type: 'number' },
            ]}
          />)
        )}

        {'milestones' in merged && Array.isArray(merged.milestones) && (
          (handledKeys.add('milestones'),
          <ObjectListInput
            label="Brand Milestones"
            items={merged.milestones as any[]}
            onChange={(newMilestones) => updateField('milestones', newMilestones)}
            defaultNewItem={{ year: '2026', event: 'Expanded online store' }}
            fields={[
              { key: 'year', label: 'Year' },
              { key: 'event', label: 'Milestone Event' },
            ]}
          />)
        )}

        {'steps' in merged && Array.isArray(merged.steps) && (
          (handledKeys.add('steps'),
          <ObjectListInput
            label="Routine Steps"
            items={merged.steps as any[]}
            onChange={(newSteps) => updateField('steps', newSteps)}
            defaultNewItem={{ step: '01', title: 'Step Name', desc: 'Description of step' }}
            fields={[
              { key: 'step', label: 'Step Number' },
              { key: 'title', label: 'Step Title' },
              { key: 'desc', label: 'Step Details', type: 'textarea' },
            ]}
          />)
        )}

        {'coupons' in merged && Array.isArray(merged.coupons) && (
          (handledKeys.add('coupons'),
          <ObjectListInput
            label="Coupon Vouchers"
            items={merged.coupons as any[]}
            onChange={(newCoupons) => updateField('coupons', newCoupons)}
            defaultNewItem={{ code: 'WELCOME10', discount: '10% OFF', detail: 'On first order' }}
            fields={[
              { key: 'code', label: 'Coupon Code' },
              { key: 'discount', label: 'Discount Badge' },
              { key: 'detail', label: 'Terms / Detail' },
            ]}
          />)
        )}

        {'badges' in merged && Array.isArray(merged.badges) && (
          (handledKeys.add('badges'),
          <ObjectListInput
            label="Trust Badges"
            items={merged.badges as any[]}
            onChange={(newBadges) => updateField('badges', newBadges)}
            defaultNewItem={{ title: 'Trust Signal', description: 'Verified guarantee' }}
            fields={[
              { key: 'title', label: 'Badge Title' },
              { key: 'description', label: 'Description' },
            ]}
          />)
        )}

        {'stats' in merged && Array.isArray(merged.stats) && (
          (handledKeys.add('stats'),
          <ObjectListInput
            label="Stat Counter Cards"
            items={merged.stats as any[]}
            onChange={(newStats) => updateField('stats', newStats)}
            defaultNewItem={{ number: '10,000+', label: 'Happy Customers' }}
            fields={[
              { key: 'number', label: 'Stat Number/Text' },
              { key: 'label', label: 'Stat Label' },
            ]}
          />)
        )}

        {'ingredients' in merged && Array.isArray(merged.ingredients) && (
          (handledKeys.add('ingredients'),
          <ObjectListInput
            label="Key Ingredients"
            items={merged.ingredients as any[]}
            onChange={(newIngredients) => updateField('ingredients', newIngredients)}
            defaultNewItem={{ name: 'Pure Organic Extract', benefit: 'Extracted for maximum purity', tag: '100% Pure' }}
            fields={[
              { key: 'name', label: 'Ingredient Name' },
              { key: 'benefit', label: 'Benefit Detail', type: 'textarea' },
              { key: 'tag', label: 'Highlight Tag' },
            ]}
          />)
        )}

        {'navLinks' in merged && Array.isArray(merged.navLinks) && (
          (handledKeys.add('navLinks'),
          <ObjectListInput
            label="Navigation Links"
            items={merged.navLinks as any[]}
            onChange={(newLinks) => updateField('navLinks', newLinks)}
            defaultNewItem={{ label: 'Shop', url: '/products' }}
            fields={[
              { key: 'label', label: 'Link Text' },
              { key: 'url', label: 'Target URL' },
            ]}
          />)
        )}

        {'tabs' in merged && Array.isArray(merged.tabs) && (
          (handledKeys.add('tabs'),
          <StringListInput
            label="Category Tabs"
            items={merged.tabs as string[]}
            onChange={(newTabs) => updateField('tabs', newTabs)}
          />)
        )}

        {'popularSearches' in merged && Array.isArray(merged.popularSearches) && (
          (handledKeys.add('popularSearches'),
          <StringListInput
            label="Popular Searches Chips"
            items={merged.popularSearches as string[]}
            onChange={(newSearches) => updateField('popularSearches', newSearches)}
          />)
        )}

        {'logos' in merged && Array.isArray(merged.logos) && (
          (handledKeys.add('logos'),
          typeof (merged.logos as any[])[0] === 'string' || (merged.logos as any[]).length === 0 ? (
            <StringListInput
              label="Brand / Certification Logos"
              items={merged.logos as string[]}
              onChange={(newLogos) => updateField('logos', newLogos)}
            />
          ) : (
            <ObjectListInput
              label="Brand Logos"
              items={merged.logos as any[]}
              onChange={(newLogos) => updateField('logos', newLogos)}
              defaultNewItem={{ name: 'Brand Name', image: '' }}
              fields={[
                { key: 'name', label: 'Brand Name' },
                { key: 'image', label: 'Logo Image', type: 'image' },
              ]}
            />
          ))
        )}

        {'concerns' in merged && Array.isArray(merged.concerns) && (
          (handledKeys.add('concerns'),
          <StringListInput
            label="Concerns List"
            items={merged.concerns as string[]}
            onChange={(newConcerns) => updateField('concerns', newConcerns)}
          />)
        )}

        {'features' in merged && Array.isArray(merged.features) && (
          (handledKeys.add('features'),
          <StringListInput
            label="Key Features List"
            items={merged.features as string[]}
            onChange={(newFeatures) => updateField('features', newFeatures)}
          />)
        )}
      </div>

      {/* 8. Fallback Dynamic Fields (Catches any remaining unhandled key) */}
      {Object.keys(merged).filter((k) => !handledKeys.has(k) && !k.startsWith('_') && k !== 'imageOverrides').length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h5 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Custom Section Settings</h5>
          {Object.keys(merged)
            .filter((k) => !handledKeys.has(k) && !k.startsWith('_') && k !== 'imageOverrides')
            .map((k) => {
              const val = merged[k];
              const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

              if (typeof val === 'boolean') {
                return <Toggle key={k} checked={val} onChange={(v) => updateField(k, v)} label={label} />;
              }
              if (typeof val === 'number') {
                return (
                  <FieldGroup key={k} label={label}>
                    <NumberInput value={val} onChange={(v) => updateField(k, v)} />
                  </FieldGroup>
                );
              }
              if (typeof val === 'string') {
                if (k.toLowerCase().includes('color')) {
                  return (
                    <FieldGroup key={k} label={label}>
                      <ColorInput value={val} onChange={(v) => updateField(k, v)} />
                    </FieldGroup>
                  );
                }
                if (k.toLowerCase().includes('image') || k.toLowerCase().includes('url')) {
                  return (
                    <FieldGroup key={k} label={label}>
                      <ImageInput value={val} onChange={(v) => updateField(k, v)} />
                    </FieldGroup>
                  );
                }
                if (val.length > 50 || k.toLowerCase().includes('desc') || k.toLowerCase().includes('text')) {
                  return (
                    <FieldGroup key={k} label={label}>
                      <TextArea value={val} onChange={(v) => updateField(k, v)} rows={2} />
                    </FieldGroup>
                  );
                }
                return (
                  <FieldGroup key={k} label={label}>
                    <TextInput value={val} onChange={(v) => updateField(k, v)} />
                  </FieldGroup>
                );
              }
              if (Array.isArray(val)) {
                if (val.length === 0 || typeof val[0] === 'string') {
                  return (
                    <StringListInput
                      key={k}
                      label={label}
                      items={val as string[]}
                      onChange={(newItems) => updateField(k, newItems)}
                    />
                  );
                }
              }
              return null;
            })}
        </div>
      )}
    </div>
  );
}

function ThemeSettings({ theme, onUpdate }: { theme: Record<string, unknown>; onUpdate: (t: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Brand Colors</h4>
      <FieldGroup label="Primary Color"><ColorInput value={(theme.primaryColor as string) || '#0f172a'} onChange={(v) => onUpdate({ ...theme, primaryColor: v })} /></FieldGroup>
      <FieldGroup label="Accent Color"><ColorInput value={(theme.accentColor as string) || '#d97706'} onChange={(v) => onUpdate({ ...theme, accentColor: v })} /></FieldGroup>
      <FieldGroup label="Background"><ColorInput value={(theme.backgroundColor as string) || '#f8fafc'} onChange={(v) => onUpdate({ ...theme, backgroundColor: v })} /></FieldGroup>
      <FieldGroup label="Text Color"><ColorInput value={(theme.textColor as string) || '#0f172a'} onChange={(v) => onUpdate({ ...theme, textColor: v })} /></FieldGroup>
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pt-2">Typography</h4>
      <FieldGroup label="Font Family"><SelectInput value={(theme.fontFamily as string) || 'inter'} onChange={(v) => onUpdate({ ...theme, fontFamily: v })} options={[{ value: 'inter', label: 'Inter' }, { value: 'plus-jakarta', label: 'Plus Jakarta Sans' }, { value: 'poppins', label: 'Poppins' }, { value: 'nunito', label: 'Nunito' }, { value: 'system', label: 'System' }]} /></FieldGroup>
      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pt-2">Appearance</h4>
      <FieldGroup label="Border Radius"><SelectInput value={(theme.borderRadius as string) || 'lg'} onChange={(v) => onUpdate({ ...theme, borderRadius: v })} options={[{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }]} /></FieldGroup>
      <FieldGroup label="Button Style"><SelectInput value={(theme.buttonStyle as string) || 'rounded'} onChange={(v) => onUpdate({ ...theme, buttonStyle: v })} options={[{ value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' }, { value: 'square', label: 'Square' }]} /></FieldGroup>
      <FieldGroup label="Card Style"><SelectInput value={(theme.cardStyle as string) || 'bordered'} onChange={(v) => onUpdate({ ...theme, cardStyle: v })} options={[{ value: 'flat', label: 'Flat' }, { value: 'shadow', label: 'Shadow' }, { value: 'bordered', label: 'Bordered' }]} /></FieldGroup>
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

      <div className="flex-1 overflow-y-auto p-3 scrollbar-none">
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
