'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Folder,
  FolderPlus,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Tags,
  Boxes,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { CategoryFormModal } from '@/components/categories/category-form-modal';

const countNodes = (nodes: any[]): number =>
  nodes.reduce((acc, n) => acc + 1 + countNodes(n.children || []), 0);

const countProducts = (nodes: any[]): number =>
  nodes.reduce((acc, n) => acc + (n._count?.products || 0) + countProducts(n.children || []), 0);

const countEmptyLeaves = (nodes: any[]): number =>
  nodes.reduce(
    (acc, n) =>
      acc +
      ((n._count?.products || 0) === 0 && (n.children || []).length === 0 ? 1 : 0) +
      countEmptyLeaves(n.children || []),
    0
  );

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = (parentId: string | null = null) => {
    setFormMode('create');
    setEditingCategory(null);
    setDefaultParentId(parentId);
    setFormOpen(true);
  };

  const openEdit = (category: any) => {
    setFormMode('edit');
    setEditingCategory(category);
    setDefaultParentId(null);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalCategories = countNodes(categories);
  const totalProducts = countProducts(categories);
  const emptyLeaves = countEmptyLeaves(categories);

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderTree className="h-6 w-6 text-amber-600" />
            <span>Categories & Collections</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hierarchical taxonomy powering storefront navigation, product grouping & collection rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="accent"
            onClick={() => openCreate(null)}
            leftIcon={<FolderPlus className="h-4 w-4 stroke-[2.5]" />}
          >
            Add Root Category
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Categories"
          value={isLoading ? '—' : totalCategories.toLocaleString('en-IN')}
          unit="nodes"
          icon={Tags}
          iconTone="amber"
          hint="Including sub-categories"
        />
        <StatCard
          label="Root Categories"
          value={isLoading ? '—' : categories.length.toLocaleString('en-IN')}
          icon={Folder}
          iconTone="blue"
          hint="Top-level collections"
        />
        <StatCard
          label="Assigned Products"
          value={isLoading ? '—' : totalProducts.toLocaleString('en-IN')}
          icon={Boxes}
          iconTone="purple"
          hint="SKUs mapped across all categories"
        />
        <StatCard
          label="Empty Categories"
          value={isLoading ? '—' : emptyLeaves.toLocaleString('en-IN')}
          icon={AlertTriangle}
          iconTone="rose"
          hint="Leaf categories with no products"
        />
      </div>

      {/* Category Hierarchy Tree */}
      <Card>
        <CardContent className="p-4 sm:p-5 divide-y divide-slate-100">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <FolderTree className="h-10 w-10 text-slate-300 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-700">No categories yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Create your first category to organize products into storefront collections.
                </p>
              </div>
              <Button variant="accent" onClick={() => openCreate(null)} leftIcon={<Plus className="h-4 w-4" />}>
                Create First Category
              </Button>
            </div>
          ) : (
            categories.map((category) => (
              <CategoryNode
                key={category.id}
                node={category}
                depth={0}
                onAddSub={(node) => openCreate(node.id)}
                onEdit={(node) => openEdit(node)}
                onDelete={(node) => setCategoryToDelete(node)}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <CategoryFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchCategories}
        mode={formMode}
        initial={editingCategory}
        defaultParentId={defaultParentId}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Delete Category</span>
              </div>
              <button
                onClick={() => {
                  setCategoryToDelete(null);
                  setDeleteError(null);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {deleteError && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
                  {deleteError}
                </div>
              )}

              <p className="text-sm text-slate-600">
                Are you sure you want to delete{' '}
                <span className="font-bold text-slate-900">"{categoryToDelete.name}"</span>? This action
                cannot be undone. Categories with sub-categories or assigned products must be emptied
                first.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setCategoryToDelete(null);
                    setDeleteError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="destructive" type="button" isLoading={isDeleting} onClick={confirmDelete}>
                  Delete Category
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryNode({
  node,
  depth,
  onAddSub,
  onEdit,
  onDelete,
}: {
  node: any;
  depth: number;
  onAddSub: (node: any) => void;
  onEdit: (node: any) => void;
  onDelete: (node: any) => void;
}) {
  const [open, setOpen] = useState(true);
  const children = node.children || [];
  const hasChildren = children.length > 0;
  const productCount = node._count?.products || 0;

  return (
    <div className={depth > 0 ? 'ml-4 sm:ml-6 border-l border-slate-200 pl-3 sm:pl-4' : ''}>
      <div className="py-3 flex items-center gap-3 group">
        <button
          onClick={() => setOpen((v) => !v)}
          className={`shrink-0 h-6 w-6 flex items-center justify-center rounded-md transition ${
            hasChildren
              ? 'text-slate-500 hover:bg-slate-100'
              : 'text-slate-200 cursor-default'
          }`}
          aria-label={hasChildren ? (open ? 'Collapse' : 'Expand') : undefined}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-150 ${hasChildren && open ? 'rotate-90' : ''}`}
          />
        </button>

        <Folder
          className={`h-4 w-4 shrink-0 ${
            hasChildren ? 'text-amber-500 fill-amber-100' : 'text-slate-400'
          }`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900">{node.name}</span>
            <Badge variant={productCount > 0 ? 'info' : 'outline'} size="sm">
              {productCount} {productCount === 1 ? 'product' : 'products'}
            </Badge>
            {hasChildren && (
              <Badge variant="outline" size="sm">
                {children.length} sub
              </Badge>
            )}
          </div>
          {node.description && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{node.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddSub(node)}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="Add sub-category"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="Edit category"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="p-1.5 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
            title="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open &&
        hasChildren &&
        children.map((child: any) => (
          <CategoryNode
            key={child.id}
            node={child}
            depth={depth + 1}
            onAddSub={onAddSub}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}