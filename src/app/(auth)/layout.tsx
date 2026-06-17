import type { ReactNode } from "react";
import Link from "next/link";

/** 认证页面共享布局 — 居中卡片 + 返回首页链接 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="mb-8 block text-center">
          <span className="text-2xl font-bold text-primary">Mini Mall</span>
        </Link>

        {children}
      </div>
    </div>
  );
}
