import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/**
 * DELETE /api/admin/categories/:id — 删除分类
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.authorized) return admin.response;

  const { id } = await params;
  const categoryId = parseInt(id, 10);

  // 检查是否有商品使用该分类
  const count = await prisma.product.count({ where: { categoryId } });
  if (count > 0) {
    return NextResponse.json(
      { error: `该分类下还有 ${count} 件商品，无法删除` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });

  return NextResponse.json({ success: true });
}
