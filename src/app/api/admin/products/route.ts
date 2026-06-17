import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

/**
 * GET /api/admin/products — 商品列表（管理后台）
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.authorized) return admin.response;

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

/**
 * POST /api/admin/products — 创建商品
 */
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.authorized) return admin.response;

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: parsed.data,
    include: { category: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
