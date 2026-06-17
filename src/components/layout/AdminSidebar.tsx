"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/products", label: "商品管理", icon: "📦" },
  { href: "/admin/categories", label: "分类管理", icon: "🏷️" },
  { href: "/admin/orders", label: "订单管理", icon: "📋" },
];

/** 后台侧边栏导航 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-6">
        <span className="text-lg font-bold text-primary">Mini Mall</span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">后台</span>
      </div>

      {/* 导航链接 */}
      <nav className="flex flex-col gap-1 p-3">
        {LINKS.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* 底部返回商城 */}
      <div className="mt-auto border-t border-gray-100 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          ← 返回商城
        </Link>
      </div>
    </aside>
  );
}
