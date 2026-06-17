"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import type { Order } from "@prisma/client";

interface AdminOrderActionsProps {
  order: Order;
}

/** 管理员订单操作 — 发货、完成、取消 */
export function AdminOrderActions({ order }: AdminOrderActionsProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        addToast("操作成功", "success");
        router.refresh();
      } else {
        const data = await res.json();
        addToast(data.error || "操作失败", "error");
      }
    } catch {
      addToast("网络错误", "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      {order.status === "CONFIRMED" && (
        <Button
          size="sm"
          onClick={() => handleAction("ship")}
          disabled={loading !== null}
        >
          {loading === "ship" ? "处理中…" : "发货"}
        </Button>
      )}
      {order.status === "SHIPPED" && (
        <Button
          size="sm"
          onClick={() => handleAction("complete")}
          disabled={loading !== null}
        >
          {loading === "complete" ? "处理中…" : "完成"}
        </Button>
      )}
      {!["COMPLETED", "CANCELLED"].includes(order.status) && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleAction("cancel")}
          disabled={loading !== null}
        >
          {loading === "cancel" ? "处理中…" : "取消"}
        </Button>
      )}
    </div>
  );
}
