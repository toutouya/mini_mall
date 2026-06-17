import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** 校验购物车项属于当前用户 */
async function getOwnCartItem(userId: number, itemId: number) {
  return prisma.cartItem.findFirst({
    where: { id: itemId, userId },
    include: { product: { select: { stock: true } } },
  });
}

/**
 * PUT /api/cart/:id — 修改购物车商品数量
 * body: { quantity: number }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
  }

  const body = await request.json();
  const quantity = parseInt(body.quantity, 10);

  if (isNaN(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "数量必须大于 0" }, { status: 400 });
  }

  // 校验归属
  const item = await getOwnCartItem(session.userId, itemId);
  if (!item) {
    return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
  }

  // 检查库存
  if (quantity > item.product.stock) {
    return NextResponse.json(
      { error: `库存不足，当前库存 ${item.product.stock} 件` },
      { status: 400 }
    );
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: true },
  });

  return NextResponse.json({ item: updated });
}

/**
 * DELETE /api/cart/:id — 删除购物车中的某一项
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
  }

  // 校验归属
  const item = await getOwnCartItem(session.userId, itemId);
  if (!item) {
    return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return NextResponse.json({ success: true });
}
