import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "./AddToCartButton";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** 动态生成 SEO 元数据 */
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, imageUrl: true },
  });

  if (!product) return { title: "商品未找到" };

  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: [product.imageUrl],
    },
  };
}

/** 商品详情页 — 大图 + 名称/价格/描述/库存 + 加入购物车 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  const isInStock = product.stock > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm text-gray-500">
        <a href="/" className="hover:text-primary">
          首页
        </a>
        <span className="mx-2">/</span>
        <a
          href={`/?category=${product.category.slug}`}
          className="hover:text-primary"
        >
          {product.category.name}
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* 商品详情 */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* 左侧 — 商品大图 */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        {/* 右侧 — 商品信息 */}
        <div className="flex flex-col gap-4">
          {/* 分类标签 */}
          <div>
            <Badge variant="info">{product.category.name}</Badge>
          </div>

          {/* 商品名称 */}
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          {/* 价格 */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">
              ¥{product.price.toFixed(2)}
            </span>
          </div>

          {/* 库存状态 */}
          <div className="flex items-center gap-2">
            <Badge variant={isInStock ? "success" : "danger"}>
              {isInStock ? `有货（库存 ${product.stock} 件）` : "暂时缺货"}
            </Badge>
          </div>

          {/* 描述 */}
          <div className="border-t border-gray-100 pt-4">
            <h2 className="mb-2 text-sm font-medium text-gray-900">商品描述</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          </div>

          {/* 加入购物车按钮 */}
          <div className="mt-auto pt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
