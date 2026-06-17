"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";

interface OrderActionButtonProps {
  orderId: number;
  /** 操作类型：pay（支付）或 cancel（取消） */
  action?: "pay" | "cancel";
}

/** 订单操作按钮 — 支持模拟支付和取消订单 */
export function OrderActionButton({ orderId, action = "pay" }: OrderActionButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const isPay = action === "pay";
  const label = isPay ? "模拟支付" : "取消订单";
  const confirmMsg = isPay ? "确认支付该订单？" : "确认取消该订单？";

  const handleClick = async () => {
    if (!confirm(confirmMsg)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        addToast(isPay ? "支付成功" : "订单已取消", "success");
        router.refresh();
      } else {
        const data = await res.json();
        addToast(data.error || "操作失败", "error");
      }
    } catch {
      addToast("网络错误，请稍后重试", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={isPay ? "primary" : "ghost"}
    >
      {loading ? "处理中…" : label}
    </Button>
  );
}
