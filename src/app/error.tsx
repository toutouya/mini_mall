"use client";

import { Button } from "@/components/ui/Button";

/** 全局错误边界 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900">出错了</h1>
      <p className="text-sm text-gray-500">
        {error.message || "页面加载失败，请稍后重试"}
      </p>
      <Button onClick={reset} variant="secondary" className="mt-4">
        重试
      </Button>
    </div>
  );
}
