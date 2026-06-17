import Link from "next/link";

/** 页脚 — 版权信息和链接 */
export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Mini Mall. 保留所有权利。</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">
              关于我们
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              联系我们
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
