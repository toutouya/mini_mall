import { prisma } from "@/lib/prisma";

/** 后台仪表盘 — 统计卡片 */
export default async function AdminDashboard() {
  const [productCount, orderCount, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } },
    }),
  ]);

  const stats = [
    { label: "商品总数", value: productCount, color: "bg-blue-50 text-blue-700" },
    { label: "订单总数", value: orderCount, color: "bg-green-50 text-green-700" },
    {
      label: "总收入",
      value: `¥${(revenue._sum.totalAmount || 0).toFixed(2)}`,
      color: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">仪表盘</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border border-gray-100 bg-white p-6 shadow-sm`}
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.color.split(" ")[1]}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
