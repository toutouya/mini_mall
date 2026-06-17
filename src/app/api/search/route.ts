import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/search?q=keyword
 * 返回匹配的商品列表（最多 8 条），用于搜索框下拉提示
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";

  if (q.trim().length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q.trim() } },
        { description: { contains: q.trim() } },
      ],
    },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}
