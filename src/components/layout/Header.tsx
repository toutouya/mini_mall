"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

import { useRouter } from "next/navigation";

/** 顶部导航栏 — Logo、搜索入口、购物车徽标、用户菜单 */
export function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [user, setUser] = useState<{ name: string } | null | undefined>(undefined);

  // 获取当前用户信息
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">Mini Mall</span>
        </Link>

        {/* 右侧操作 */}
        <nav className="flex items-center gap-3">
          {/* 用户菜单 */}
          {user === undefined ? (
            <span className="h-6 w-16 animate-pulse rounded bg-gray-100" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/orders"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                我的订单
              </Link>
              <Link
                href="/profile"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              登录
            </Link>
          )}

          {/* 购物车 */}
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="购物车"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
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
