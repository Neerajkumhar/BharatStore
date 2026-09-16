'use client';

import React, { useState, useEffect } from 'react';
import { X, FolderPlus, FolderEdit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  initial?: any | null;
  defaultParentId?: string | null;
  categories?: any[];
}

interface CategoryOption {
  id: string;
  name: string;
  depth: number;
}

const flattenCategories = (roots: any[] = [], depth = 0): CategoryOption[] => {
  const options: CategoryOption[] = [];
  for (const node of roots) {
    options.push({ id: node.id, name: node.name, depth });
    options.push(...flattenCategories(node.children || [], depth + 1));
  }
  return options;
};

export function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  initial = null,
  defaultParentId = null,
  categories = [],
}: CategoryFormModalProps) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [parentId, setParentId] = useState<string>(
    (mode === 'edit' ? initial?.parentId : defaultParentId) || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initial?.name || '');
      setDescription(initial?.description || '');
      setParentId((mode === 'edit' ? initial?.parentId : defaultParentId) || '');
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, initial, defaultParentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: parentId || null,
    };

    try {
      const url = mode === 'edit' && initial ? `/api/categories/${initial.id}` : '/api/categories';
      const res = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${mode === 'edit' ? 'update' : 'create'} category`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            {mode === 'edit' ? (
              <FolderEdit className="h-5 w-5 text-amber-600" />
            ) : (
              <FolderPlus className="h-5 w-5 text-amber-600" />
            )}
            <span>{mode === 'edit' ? 'Edit Category' : 'Add New Category'}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Category Name"
            placeholder="e.g. Silk Sarees, Cotton Suits, Electronics"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800">Parent Category</label>
            <select
              className="w-full h-10 px-3 border border-slate-300 rounded-md bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">None (Root level)</option>
              {flattenCategories(categories).map((option) => {
                const isSelf = mode === 'edit' && initial && option.id === initial.id;
                const isDescendant =
                  mode === 'edit' && initial && isDescendantOf(initial, option.id);
                if (isSelf || isDescendant) return null;
                return (
                  <option key={option.id} value={option.id}>
                    {'\u00A0'.repeat(option.depth * 3)}
                    {option.depth > 0 ? '└ ' : ''}
                    {option.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-800">Description (Optional)</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
              rows={3}
              placeholder="Brief summary of items in this category"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {mode === 'edit' ? 'Save Changes' : 'Save Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function isDescendantOf(category: any, potentialDescendantId: string): boolean {
  const walk = (node: any): boolean => {
    if (!node.children) return false;
    for (const child of node.children) {
      if (child.id === potentialDescendantId) return true;
      if (walk(child)) return true;
    }
    return false;
  };
  return walk(category);
}