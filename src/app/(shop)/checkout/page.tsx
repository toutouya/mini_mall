import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckoutForm } from "./CheckoutForm";

/** 结算页面 — 展示购物车摘要 + 收货信息表单 */
export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/checkout");
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">结算</h1>
        <EmptyState
          title="购物车是空的"
          description="请先将商品加入购物车"
          action={<Button href="/">去逛逛</Button>}
        />
      </div>
    );
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">结算</h1>

      {/* 商品摘要 */}
      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-gray-700">订单摘要</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-600">
                {item.product.name}
                <span className="ml-2 text-gray-400">x{item.quantity}</span>
              </span>
              <span className="font-medium text-gray-900">
                ¥{(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-lg font-medium text-gray-900">合计</span>
          <span className="text-2xl font-bold text-primary">
            ¥{totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 收货信息表单 */}
      <CheckoutForm />
    </div>
  );
}
