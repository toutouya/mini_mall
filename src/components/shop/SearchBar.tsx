"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef } from "react";

/** 搜索框 — 回车或点击搜索图标后跳转到带 search 参数的首页 */
export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    const category = searchParams.get("category");
    const trimmed = valueRef.current.trim();

    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }

    // 保留分类筛选
    if (category) {
      params.set("category", category);
    }

    router.push(`/?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="搜索商品…"
        className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {/* 搜索图标 */}
      <button
        onClick={handleSearch}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
        aria-label="搜索"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  );
}
