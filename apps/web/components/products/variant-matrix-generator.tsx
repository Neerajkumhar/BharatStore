'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface VariantRow {
  sku: string;
  barcode: string;
  variantName: string;
  priceOverride?: number;
  weightGrams: number;
  initialStock: number;
  lowStockAlert: number;
}

interface VariantMatrixGeneratorProps {
  baseTitle: string;
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
}

export function VariantMatrixGenerator({ baseTitle, variants, onChange }: VariantMatrixGeneratorProps) {
  const [option1Name, setOption1Name] = useState('Color');
  const [option1Values, setOption1Values] = useState('Red, Gold, Mint');
  const [option2Name, setOption2Name] = useState('Size');
  const [option2Values, setOption2Values] = useState('Standard');

  const generateMatrix = () => {
    const vals1 = option1Values.split(',').map((v) => v.trim()).filter(Boolean);
    const vals2 = option2Values.split(',').map((v) => v.trim()).filter(Boolean);

    const prefix = (baseTitle || 'SKU').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const newVariants: VariantRow[] = [];

    if (vals1.length > 0 && vals2.length > 0) {
      vals1.forEach((v1) => {
        vals2.forEach((v2) => {
          const vName = `${v1} / ${v2}`;
          const code1 = v1.toUpperCase().slice(0, 3);
          const code2 = v2.toUpperCase().slice(0, 3);
          newVariants.push({
            sku: `${prefix}-${code1}-${code2}`,
            barcode: '',
            variantName: vName,
            weightGrams: 500,
            initialStock: 10,
            lowStockAlert: 3,
          });
        });
      });
    } else if (vals1.length > 0) {
      vals1.forEach((v1) => {
        const code1 = v1.toUpperCase().slice(0, 3);
        newVariants.push({
          sku: `${prefix}-${code1}`,
          barcode: '',
          variantName: v1,
          weightGrams: 500,
          initialStock: 10,
          lowStockAlert: 3,
        });
      });
    }

    if (newVariants.length > 0) {
      onChange(newVariants);
    }
  };

  const updateVariantRow = (index: number, field: keyof VariantRow, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeVariantRow = (index: number) => {
    const updated = variants.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const addManualVariant = () => {
    const prefix = (baseTitle || 'SKU').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    onChange([
      ...variants,
      {
        sku: `${prefix}-VAR-${variants.length + 1}`,
        barcode: '',
        variantName: `Variant ${variants.length + 1}`,
        weightGrams: 0,
        initialStock: 5,
        lowStockAlert: 2,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Option Generator Controls */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
          <span className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-amber-600" />
            <span>Variant Matrix Auto-Generator</span>
          </span>
          <Button variant="ghost" size="sm" onClick={generateMatrix} leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-600" />}>
            Generate Combinations
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Option 1 (e.g. Color)"
            value={option1Values}
            onChange={(e) => setOption1Values(e.target.value)}
            helperText="Comma separated: Red, Blue, Gold"
          />
          <Input
            label="Option 2 (e.g. Size)"
            value={option2Values}
            onChange={(e) => setOption2Values(e.target.value)}
            helperText="Comma separated: S, M, L, Standard"
          />
        </div>
      </div>

      {/* Variant Rows Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Variants & Stock ({variants.length})
          </span>
          <Button variant="secondary" size="sm" onClick={addManualVariant} leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Add Row
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-2xs font-semibold">
              <tr>
                <th className="px-3 py-2">Variant Name</th>
                <th className="px-3 py-2">SKU Code</th>
                <th className="px-3 py-2">Weight (g)</th>
                <th className="px-3 py-2">Initial Stock</th>
                <th className="px-3 py-2">Low Alert</th>
                <th className="px-3 py-2 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {variants.map((variant, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      className="w-full h-8 px-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
                      value={variant.variantName}
                      onChange={(e) => updateVariantRow(idx, 'variantName', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      className="w-full h-8 px-2 font-mono border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
                      value={variant.sku}
                      onChange={(e) => updateVariantRow(idx, 'sku', e.target.value)}
                    />
                  </td>
                  <td className="px-3 py-2 w-24">
                    <input
                      type="number"
                      className="w-full h-8 px-2 font-tabular border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none"
                      value={variant.weightGrams}
                      onChange={(e) => updateVariantRow(idx, 'weightGrams', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-3 py-2 w-28">
                    <input
                      type="number"
                      className="w-full h-8 px-2 font-tabular font-bold border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none text-slate-900"
                      value={variant.initialStock}
                      onChange={(e) => updateVariantRow(idx, 'initialStock', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-3 py-2 w-24">
                    <input
                      type="number"
                      className="w-full h-8 px-2 font-tabular border border-slate-300 rounded focus:ring-1 focus:ring-slate-900 focus:outline-none text-slate-700"
                      value={variant.lowStockAlert}
                      onChange={(e) => updateVariantRow(idx, 'lowStockAlert', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariantRow(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
