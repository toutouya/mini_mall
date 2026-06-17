"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import type { Product } from "@prisma/client";

interface AddToCartButtonProps {
  product: Product;
}

/** 加入购物车按钮 — 客户端组件，点击后往购物车添加商品并弹出 Toast */
export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, removeItem: removeFromCart } = useCart();
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);
  const isInStock = product.stock > 0;

  const handleClick = async () => {
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
    <Button
      size="lg"
      onClick={handleClick}
      disabled={!isInStock || adding}
      className="w-full sm:w-auto"
    >
      {isInStock ? "加入购物车" : "暂时缺货"}
    </Button>
  );
}
