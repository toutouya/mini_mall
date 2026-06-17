import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CartItemsList } from "./CartItemsList";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

/** 购物车页面 — Server Component 从服务端获取数据 */
export default async function CartPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/cart");
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">购物车</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
          }
          title="购物车是空的"
          description="快去挑选喜欢的商品吧"
          action={<Button href="/">去逛逛</Button>}
        />
      ) : (
        <>
          {/* 购物车列表（客户端组件，含 +/- 和删除交互） */}
          <CartItemsList items={items} />

          {/* 底部总价和操作 */}
          <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">合计</span>
              <span className="text-2xl font-bold text-primary">
                ¥{totalPrice.toFixed(2)}
              </span>
            </div>
            <Button href="/checkout" size="lg" className="mt-4 w-full">
              提交订单
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
