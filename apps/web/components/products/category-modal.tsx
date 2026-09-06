'use client';

import React, { useState } from 'react';
import { X, FolderPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CategoryModal({ isOpen, onClose, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      setName('');
      setDescription('');
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
            <FolderPlus className="h-5 w-5 text-amber-600" />
            <span>Add New Category</span>
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
              Save Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
