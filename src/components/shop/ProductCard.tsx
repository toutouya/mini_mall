"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Product, Category } from "@prisma/client";

interface ProductCardProps {
  product: Product & { category: Category };
}

/** 商品卡片 — 包含图片、名称、价格、分类标签、"加入购物车"按钮 */
export function ProductCard({ product }: ProductCardProps) {
  const { addItem, removeItem: removeFromCart } = useCart();
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);

    const cartItem = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    };

    // 先更新客户端购物车（即时反馈 Header 徽标）
    addItem(cartItem);

    try {
      // 同步到服务端购物车（登录用户持久化）
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (res.ok) {
        addToast(`"${product.name}" 已加入购物车`, "success");
      } else if (res.status === 401) {
        addToast(`"${product.name}" 已加入购物车`, "success");
      } else {
        const data = await res.json();
        addToast(data.error || "添加失败", "error");
        // API 失败时回滚客户端购物车
        removeFromCart(product.id);
      }
    } catch {
      addToast("网络错误，请稍后重试", "error");
      removeFromCart(product.id);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
      {/* 商品图片 */}
      <Link href={`/products/${product.slug}`} className="block overflow-hidden rounded-t-xl">
        <div className="relative aspect-square bg-gray-50">
          {imgError ? (
            <div className="flex h-full w-full flex-col items-center justify-center text-gray-300">
              <svg className="mb-1 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-400">暂无图片</span>
            </div>
          ) : (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </Link>

      {/* 商品信息 */}
      <div className="flex flex-col gap-2 p-4">
        {/* 分类标签 */}
        <Badge variant="info">{product.category.name}</Badge>

        {/* 商品名称 */}
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* 描述 */}
        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>

        {/* 价格和按钮 */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-primary">
            ¥{product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
          >
            {product.stock === 0 ? "缺货" : "加入购物车"}
          </Button>
        </div>
      </div>
    </div>
  );
}
