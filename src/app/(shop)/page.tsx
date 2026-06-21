import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { SearchBar } from "@/components/shop/SearchBar";
import { Pagination } from "@/components/shop/Pagination";

const PAGE_SIZE = 12;

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

/** 首页 — 商品列表 + 搜索框 + 分类筛选 + 分页 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const hasFilters = !!(search || category);

  // 构建查询条件（findMany 和 count 共用）
  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
  };

  // 并行查询商品列表、总数、分类列表
  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  // 重整分类数据，避免在组件层暴露 Prisma 内部类型
  const categoryList = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    productCount: cat._count.products,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">商品列表</h1>
        {search && (
          <p className="mt-1 text-sm text-gray-500">
            搜索 &quot;{search}&quot; 的结果
            {category && "（已筛选分类）"}
          </p>
        )}
      </div>

      {/* 搜索框 + 分类导航 */}
      <div className="mb-6 space-y-4">
        <SearchBar />
        <CategoryNav categories={categoryList} />
      </div>

      {/* 商品网格 */}
      <ProductGrid products={products} isFiltered={hasFilters} />

      {/* 分页 */}
      <div className="mt-8">
        <Pagination currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
