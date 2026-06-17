"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** 登录页面 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 服务端返回统一的错误消息，直接展示
        setError(typeof data.error === "string" ? data.error : "请检查邮箱和密码");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-center text-xl font-bold text-gray-900">登录</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 邮箱 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="请输入邮箱"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 密码 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="请输入密码"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* 提交按钮 */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "登录中…" : "登录"}
        </Button>
      </form>

      {/* 注册链接 */}
      <p className="mt-4 text-center text-sm text-gray-500">
        还没有账号？
        <Link href="/register" className="ml-1 text-primary hover:underline">
          立即注册
        </Link>
      </p>
    </div>
  );
}
