"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

interface DeleteButtonProps {
  productId: number;
  productName: string;
}

/** 删除商品按钮 — 客户端确认 + API 调用 */
export function DeleteButton({ productId, productName }: DeleteButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`确认删除 "${productName}"？`)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast(`"${productName}" 已删除`, "success");
        router.refresh();
      } else {
        const data = await res.json();
        addToast(data.error || "删除失败", "error");
      }
    } catch {
      addToast("网络错误", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-500 hover:underline disabled:opacity-30"
    >
      {loading ? "删除中…" : "删除"}
    </button>
  );
}
