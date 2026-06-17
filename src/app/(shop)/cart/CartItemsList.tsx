"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import type { CartItem, Product } from "@prisma/client";

type CartItemWithProduct = CartItem & { product: Product };

interface CartItemsListProps {
  items: CartItemWithProduct[];
}

/** 购物车商品列表 — 客户端组件，支持 +/- 调整数量和删除 */
export function CartItemsList({ items: initialItems }: CartItemsListProps) {
  const { addToast } = useToast();
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState<number | null>(null);

  const handleUpdateQuantity = async (itemId: number, newQty: number) => {
    setLoading(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: newQty } : item
          )
        );
      } else {
        const data = await res.json();
        addToast(data.error || "更新失败", "error");
      }
    } catch {
      addToast("网络错误，请稍后重试", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (itemId: number) => {
    setLoading(itemId);
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        addToast("已从购物车移除", "success");
      } else {
        addToast("删除失败", "error");
      }
    } catch {
      addToast("网络错误，请稍后重试", "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          {/* 商品图片 */}
          <Link href={`/products/${item.product.slug}`} className="shrink-0">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-50">
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          </Link>

          {/* 商品信息 */}
          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <Link
              href={`/products/${item.product.slug}`}
              className="text-sm font-medium text-gray-900 hover:text-primary truncate"
            >
              {item.product.name}
            </Link>
            <span className="text-sm font-bold text-primary">
              ¥{item.product.price.toFixed(2)}
            </span>
          </div>

          {/* 数量调整 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              disabled={loading === item.id || item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              disabled={
                loading === item.id || item.quantity >= item.product.stock
              }
              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* 小计 */}
          <span className="w-20 text-right text-sm font-medium text-gray-900">
            ¥{(item.product.price * item.quantity).toFixed(2)}
          </span>

          {/* 删除 */}
          <button
            onClick={() => handleDelete(item.id)}
            disabled={loading === item.id}
            className="shrink-0 text-sm text-gray-400 hover:text-red-500 disabled:opacity-30"
          >
            删除
          </button>
        </div>
      ))}
    </div>
  );
}
