import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { ORDER_STATUS_MAP } from "@/lib/constants";
import { OrderActionButton } from "./OrderActionButton";

/** 订单详情页 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  const session = await getSession();
  if (!session) {
    redirect(`/login?redirect=/orders/${encodeURIComponent(id)}`);
  }

  if (isNaN(orderId)) notFound();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.userId },
    include: { items: true },
  });

  if (!order) notFound();

  const status = ORDER_STATUS_MAP[order.status] || { variant: "default" as const, label: order.status };
  const canPay = order.status === "PENDING";
  const canCancel = !["COMPLETED", "CANCELLED"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* 面包屑 */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/orders" className="hover:text-primary">
          我的订单
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">订单 #{order.id}</span>
      </nav>

      {/* 订单头 */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">订单 #{order.id}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex gap-2">
          {canPay && <OrderActionButton orderId={order.id} />}
          {canCancel && <OrderActionButton orderId={order.id} action="cancel" />}
        </div>
      </div>

      {/* 商品明细 */}
      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-700">商品明细</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    ¥{item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ¥{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 合计 */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-base font-medium text-gray-900">合计</span>
          <span className="text-xl font-bold text-primary">
            ¥{order.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 收货信息 */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-700">收货信息</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>收货人：{order.shippingName}</p>
          <p>邮箱：{order.shippingEmail}</p>
          <p>地址：{order.shippingAddr}</p>
        </div>
      </div>
    </div>
  );
}
