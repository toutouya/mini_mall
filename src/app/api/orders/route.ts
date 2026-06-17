import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const createOrderSchema = z.object({
  shippingName: z.string().min(1, "收货人不能为空").max(50),
  shippingEmail: z.string().email("请输入有效的邮箱"),
  shippingAddr: z.string().min(1, "收货地址不能为空").max(200),
});

/**
 * GET /api/orders — 获取当前用户的订单列表
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

/**
 * POST /api/orders — 从购物车创建订单
 * body: { shippingName, shippingEmail, shippingAddr }
 *
 * 事务中执行：创建订单 → 扣减库存 → 清空购物车
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  // 校验收货信息
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { shippingName, shippingEmail, shippingAddr } = parsed.data;

  // 获取购物车商品
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "购物车为空" }, { status: 400 });
  }

  // 检查库存并计算总价
  let totalAmount = 0;
  const insufficientStock: string[] = [];

  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      insufficientStock.push(
        `${item.product.name}（需要 ${item.quantity} 件，库存 ${item.product.stock} 件）`
      );
    }
    totalAmount += item.product.price * item.quantity;
  }

  if (insufficientStock.length > 0) {
    return NextResponse.json(
      { error: `以下商品库存不足：${insufficientStock.join("；")}` },
      { status: 400 }
    );
  }

  // 事务：创建订单 + 二次校验库存 + 扣库存 + 清空购物车
  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. 事务内二次校验库存（防止 TOCTOU 竞态）
    for (const item of cartItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true },
      });
      if (!product || product.stock < item.quantity) {
        throw new Error(
          `${product?.name || "商品"}库存不足（需要 ${item.quantity} 件，库存 ${product?.stock ?? 0} 件）`
        );
      }
    }

    // 2. 创建订单
    const order = await tx.order.create({
      data: {
        userId: session.userId,
        status: "PENDING",
        paymentStatus: "PENDING",
        totalAmount,
        shippingName,
        shippingEmail,
        shippingAddr,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            name: item.product.name,
            imageUrl: item.product.imageUrl,
          })),
        },
      },
      include: { items: true },
    });

    // 3. 扣减库存
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 4. 清空购物车
    await tx.cartItem.deleteMany({
      where: { userId: session.userId },
    });

    return order;
  });

  return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "下单失败，请稍后重试" },
      { status: 400 }
    );
  }
}
