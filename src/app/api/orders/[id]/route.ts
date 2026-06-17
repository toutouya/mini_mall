import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** 校验订单属于当前用户 */
async function getOwnOrder(userId: number, orderId: number) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
}

/**
 * GET /api/orders/:id — 订单详情
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "无效的订单 ID" }, { status: 400 });
  }

  const order = await getOwnOrder(session.userId, orderId);
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

/**
 * PUT /api/orders/:id — 修改订单状态
 * body: { action: "pay" | "ship" | "cancel" }
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "无效的订单 ID" }, { status: 400 });
  }

  const order = await getOwnOrder(session.userId, orderId);
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  const body = await request.json();
  const action = body.action as string;

  // 状态流转映射
  const transitions: Record<string, { status: string; paymentStatus?: string }> = {
    pay: { status: "CONFIRMED", paymentStatus: "PAID" },
    cancel: { status: "CANCELLED" },
  };

  const transition = transitions[action];
  if (!transition) {
    return NextResponse.json(
      { error: "无效的操作，支持：pay, cancel" },
      { status: 400 }
    );
  }

  // 校验当前状态允许此操作
  if (action === "pay" && order.status !== "PENDING") {
    return NextResponse.json(
      { error: "当前订单状态不支持支付" },
      { status: 400 }
    );
  }

  if (action === "cancel" && ["COMPLETED", "CANCELLED"].includes(order.status)) {
    return NextResponse.json(
      { error: "当前订单状态不支持取消" },
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
