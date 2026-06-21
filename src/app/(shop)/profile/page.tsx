import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/validations";

/**
 * 个人主页 — 展示用户信息 + 订单统计
 * 需登录，未登录重定向到 /login
 */
export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // 订单统计
  const [totalOrders, statusCounts] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    Promise.all(
      ORDER_STATUSES.map((status) =>
        prisma.order
          .count({ where: { userId: user.id, status } })
          .then((count) => ({ status, count }))
      )
    ),
  ]);

  const statusMap: Record<string, string> = {
    PENDING: "待处理",
    CONFIRMED: "已确认",
    SHIPPED: "已发货",
    DELIVERED: "已签收",
    CANCELLED: "已取消",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">个人主页</h1>

      {/* 用户信息卡片 */}
      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t border-gray-50 pt-4 text-sm text-gray-500">
          <span>
            角色：{user.role === "ADMIN" ? "管理员" : "普通用户"}
          </span>
          <span>
            注册于 {new Date(user.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
      </div>

      {/* 订单概览 */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">订单概览</h3>
          <Link
            href="/orders"
            className="text-sm text-primary hover:underline"
          >
            查看全部订单 ({totalOrders})
          </Link>
        </div>

        {totalOrders === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            暂无订单，快去逛逛吧～
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {statusCounts.map(({ status, count }) => (
              <div
                key={status}
                className="flex flex-col items-center rounded-lg border border-gray-50 p-3"
              >
                <span
                  className={`mb-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status]}`}
                >
                  {statusMap[status]}
                </span>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
