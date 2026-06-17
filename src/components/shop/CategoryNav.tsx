"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

/** 分类的展示信息（不直接暴露 Prisma 内部类型） */
interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

interface CategoryNavProps {
  categories: CategoryInfo[];
}

/** 分类导航标签 — 水平滚动标签，点击切换分类筛选 */
export function CategoryNav({ categories }: CategoryNavProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  const buildHref = (slug: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (search) params.set("search", search);
    return `/?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {/* "全部"标签 */}
      <Link
        href={search ? `/?search=${encodeURIComponent(search)}` : "/"}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          !currentCategory
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        全部
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={buildHref(cat.slug)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            currentCategory === cat.slug
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {cat.name}
          <span className="ml-1 text-xs opacity-70">({cat.productCount})</span>
        </Link>
      ))}
    </div>
  );
}
