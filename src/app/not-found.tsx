import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** 全局 404 页面 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="text-xl font-medium text-gray-500">页面未找到</h2>
      <p className="text-sm text-gray-400">您访问的页面不存在或已被移除</p>
      <Button href="/" variant="primary" size="md" className="mt-4">
        返回首页
      </Button>
    </div>
  );
}
