import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * GET /api/cart — 获取当前用户的购物车列表（需登录）
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

/**
 * POST /api/cart — 加入购物车
 * body: { productId: number, quantity?: number }
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const body = await request.json();
  const productId = parseInt(body.productId, 10);
  const quantity = Math.max(1, parseInt(body.quantity, 10) || 1);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "无效的商品 ID" }, { status: 400 });
  }

  // 检查商品存在且库存充足
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true },
  });

  if (!product) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  // 获取购物车中该商品已有数量
  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: session.userId, productId } },
    select: { id: true, quantity: true },
  });

  const totalQuantity = (existing?.quantity || 0) + quantity;

  if (totalQuantity > product.stock) {
    return NextResponse.json(
      { error: `库存不足，当前库存 ${product.stock} 件` },
      { status: 400 }
    );
  }

  // Upsert：已有则增量，无则新建
  const item = await prisma.cartItem.upsert({
    where: {
      userId_productId: { userId: session.userId, productId },
    },
    update: { quantity: totalQuantity },
    create: { userId: session.userId, productId, quantity },
    include: { product: true },
  });

  return NextResponse.json({ item }, { status: 201 });
}
