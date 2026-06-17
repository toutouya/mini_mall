"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, Category } from "@prisma/client";

type ProductWithCategory = Product & { category: Category };

/** 搜索框 — 回车/点击搜索 + 输入防抖下拉提示 */
export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");
  const [results, setResults] = useState<ProductWithCategory[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const valueRef = useRef(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  valueRef.current = value;

  // 防抖搜索建议
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // 取消前一个未完成的请求
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data.products || []);
        setShowDropdown(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          // 忽略网络错误
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (searchValue?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const category = searchParams.get("category");
    const trimmed = (searchValue ?? valueRef.current).trim();

    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }
    if (category) params.set("category", category);

    setShowDropdown(false);
    router.push(`/?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        placeholder="搜索商品…"
        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        onClick={() => handleSearch()}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
        aria-label="搜索"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* 下拉建议列表 */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-gray-100 bg-white shadow-lg">
          {results.length > 0 ? (
            results.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-50">
                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="40px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category.name}</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-primary">¥{p.price.toFixed(2)}</span>
            </Link>
          ))
          ) : (
            <p className="px-4 py-3 text-sm text-gray-400">未找到匹配的商品</p>
          )}
        </div>
      )}
    </div>
  );
}
