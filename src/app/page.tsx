import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold tracking-tight">Mini Mall</h1>
      <p className="text-gray-500">微型电商平台</p>
      <div className="mt-4 flex gap-6 text-sm text-gray-400">
        <span>{categoryCount} 个分类</span>
        <span>{productCount} 个商品</span>
      </div>
      <p className="mt-8 text-xs text-gray-300">Phase 1 — 基础设施搭建完成</p>
    </div>
  );
}
