import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/orders/:id — 订单详情
 * PUT /api/admin/orders/:id — 更新订单状态
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.authorized) return admin.response;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id, 10) },
    include: { items: true, user: { select: { name: true, email: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.authorized) return admin.response;

  const { id } = await params;
  const orderId = parseInt(id, 10);

  // 先查订单（cancel 需要 items 做库存恢复，其他不需要）
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  const body = await request.json();
  const action = body.action as string;

  // 状态流转映射 + 允许的前置状态
  const transitions: Record<string, { status: string; paymentStatus?: string; allowedFrom: string[] }> = {
    ship: { status: "SHIPPED", allowedFrom: ["CONFIRMED"] },
    complete: { status: "DELIVERED", allowedFrom: ["SHIPPED"] },
    cancel: { status: "CANCELLED", allowedFrom: ["PENDING", "CONFIRMED", "SHIPPED"] },
  };

  const transition = transitions[action];
  if (!transition) {
    return NextResponse.json(
      { error: "无效的操作，支持：ship, complete, cancel" },
      { status: 400 }
    );
  }

  // 校验当前状态允许该操作
  if (!transition.allowedFrom.includes(order.status)) {
    return NextResponse.json(
      { error: `当前状态（${order.status}）不支持此操作` },
      { status: 400 }
    );
  }

  // 取消时恢复库存
  if (action === "cancel") {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: transition.status },
      });
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });
  } else {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: transition.status,
        ...(transition.paymentStatus
          ? { paymentStatus: transition.paymentStatus }
          : {}),
      },
    });
  }

  return NextResponse.json({ success: true });
}
