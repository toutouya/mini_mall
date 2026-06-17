"use client";

import { useEffect, useRef } from "react";
import type { CartItem, Product } from "@prisma/client";

type CartItemWithProduct = CartItem & { product: Product };

interface CartSyncProps {
  serverItems: CartItemWithProduct[];
}

/** 将服务端购物车数据同步到客户端 localStorage，保持 Header 徽标准确 */
export function CartSync({ serverItems }: CartSyncProps) {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    if (serverItems.length === 0) {
      localStorage.setItem("cart", "[]");
    } else {
      const items = serverItems.map((item) => ({
        productId: item.productId,
        slug: item.product.slug,
        name: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
      }));
      localStorage.setItem("cart", JSON.stringify(items));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
