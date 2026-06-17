"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

/** 分页导航 — 上一页/页码/下一页 */
export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    return `/?${params.toString()}`;
  };

  // 生成页码列表（最多显示 7 个页码）
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="分页导航">
      {/* 上一页 */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          上一页
        </Link>
      ) : (
        <span className="rounded-lg px-3 py-2 text-sm text-gray-300">上一页</span>
      )}

      {/* 页码 */}
      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* 下一页 */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          下一页
        </Link>
      ) : (
        <span className="rounded-lg px-3 py-2 text-sm text-gray-300">下一页</span>
      )}
    </nav>
  );
}
