"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/admin/DataTable";
import { ORDER_STATUS_MAP } from "@/lib/constants";
import type { Order, OrderItem, User } from "@prisma/client";

type OrderWithIncludes = Order & {
  items: OrderItem[];
  user: Pick<User, "name" | "email">;
};

/** 订单管理列表页 */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithIncludes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">订单管理</h1>

      <DataTable
        data={orders}
        keyAccessor={(o) => o.id}
        emptyMessage={loading ? "加载中…" : "暂无订单"}
        columns={[
          {
            header: "订单号",
            accessor: (o) => (
              <Link
                href={`/admin/orders/${o.id}`}
                className="font-medium text-primary hover:underline"
              >
                #{o.id}
              </Link>
            ),
          },
          {
            header: "用户",
            accessor: (o) => (
              <span className="text-gray-600">{o.user.name}</span>
            ),
          },
          {
            header: "金额",
            accessor: (o) => `¥${o.totalAmount.toFixed(2)}`,
          },
          {
            header: "状态",
            accessor: (o) => {
              const s = ORDER_STATUS_MAP[o.status] || {
                variant: "default" as const,
                label: o.status,
              };
              return <Badge variant={s.variant}>{s.label}</Badge>;
            },
          },
          {
            header: "时间",
            accessor: (o) => new Date(o.createdAt).toLocaleDateString("zh-CN"),
          },
        ]}
        actions={(o) => (
          <Link
            href={`/admin/orders/${o.id}`}
            className="text-sm text-primary hover:underline"
          >
            详情
          </Link>
        )}
      />
    </div>
  );
}
