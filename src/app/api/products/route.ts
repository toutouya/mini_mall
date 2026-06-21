import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 12;

/**
 * GET /api/products
 * 查询参数：search（模糊搜索）、category（按分类 slug 筛选）、page（分页，从 1 开始）
 * 返回商品列表 + 分页信息 + 所有分类
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  // 构建查询条件
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return NextResponse.json({
    products,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages,
    },
  });
}
