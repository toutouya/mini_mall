import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";

/**
 * GET /api/admin/categories — 分类列表
 * POST /api/admin/categories — 创建分类
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.authorized) return admin.response;

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.authorized) return admin.response;

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: parsed.data,
  });

  return NextResponse.json({ category }, { status: 201 });
}
