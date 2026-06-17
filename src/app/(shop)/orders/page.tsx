import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ORDER_STATUS_MAP } from "@/lib/constants";

/** 订单列表页 */
export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">我的订单</h1>

      {orders.length === 0 ? (
        <EmptyState
          title="暂无订单"
          description="快去挑选喜欢的商品吧"
          action={<Button href="/">去逛逛</Button>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = ORDER_STATUS_MAP[order.status] || { variant: "default" as const, label: order.status };
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  {/* 订单号和状态 */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      订单 #{order.id}
                    </span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  {/* 金额 */}
                  <span className="text-lg font-bold text-primary">
                    ¥{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* 商品摘要和时间 */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>
                    {order.items.length} 件商品
                    <span className="ml-2">
                      ({(() => { const names = order.items.map((i) => i.name).join("、"); return names.length > 60 ? names.slice(0, 60) + "…" : names; })()})
                    </span>
                  </span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
