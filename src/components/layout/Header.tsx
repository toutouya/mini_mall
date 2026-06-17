"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

/** 顶部导航栏 — Logo、搜索入口、购物车徽标 */
export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Mini Mall</span>
        </Link>

        {/* 右侧操作 */}
        <nav className="flex items-center gap-4">
          {/* 暂时隐藏搜索（首页有搜索框），后续可改为图标 */}
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="购物车"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
