"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** 注册页面 */
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 服务端可能返回字段级错误（Zod）或通用错误（字符串）
        if (typeof data.error === "string") {
          setErrors({ _form: [data.error] });
        } else {
          setErrors(data.error);
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrors({ _form: ["网络错误，请稍后重试"] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-center text-xl font-bold text-gray-900">注册</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 用户名 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">用户名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="请输入用户名"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors?.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>
          )}
        </div>

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
          {errors?.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email[0]}</p>
          )}
        </div>

        {/* 密码 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="至少 6 位密码"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors?.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password[0]}</p>
          )}
        </div>

        {/* 表单级错误 */}
        {errors?._form && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {errors._form[0]}
          </p>
        )}

        {/* 提交按钮 */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "注册中…" : "注册"}
        </Button>
      </form>

      {/* 登录链接 */}
      <p className="mt-4 text-center text-sm text-gray-500">
        已有账号？
        <Link href="/login" className="ml-1 text-primary hover:underline">
          立即登录
        </Link>
      </p>
    </div>
  );
}
