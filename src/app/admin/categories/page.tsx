"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { useToast } from "@/hooks/useToast";

interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  /** API 原始响应中的 _count（仅在 fetch 后转换） */
  _count?: { products: number };
}

/** 分类管理页 — 列表 + 新增表单 */
export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories((d.categories || []).map((c: CategoryWithCount) => ({ ...c, productCount: c._count?.products ?? 0 }))))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description: description || undefined }),
      });

      if (res.ok) {
        addToast(`分类 "${name}" 已创建`, "success");
        setName("");
        setSlug("");
        setDescription("");
        fetchCategories();
      } else {
        const d = await res.json();
        setError(typeof d.error === "string" ? d.error : "请检查表单");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    if (!confirm(`确认删除分类 "${catName}"？`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast(`分类 "${catName}" 已删除`, "success");
        fetchCategories();
      } else {
        const d = await res.json();
        addToast(d.error || "删除失败", "error");
      }
    } catch {
      addToast("网络错误", "error");
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">分类管理</h1>

      {/* 新增表单 */}
      <form
        onSubmit={handleCreate}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">名称</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">描述</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-48 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "创建中…" : "新增分类"}
        </Button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </form>

      {/* 列表 */}
      <DataTable
        data={categories}
        keyAccessor={(c) => c.id}
        emptyMessage={loading ? "加载中…" : "暂无分类"}
        columns={[
          { header: "名称", accessor: (c) => c.name },
          { header: "Slug", accessor: (c) => c.slug },
          {
            header: "描述",
            accessor: (c) => (
              <span className="text-gray-400">{c.description || "-"}</span>
            ),
          },
          {
            header: "商品数",
            accessor: (c) => c.productCount,
          },
        ]}
        actions={(c) => (
          <button
            onClick={() => handleDelete(c.id, c.name)}
            className="text-sm text-red-500 hover:underline"
          >
            删除
          </button>
        )}
      />
    </div>
  );
}
