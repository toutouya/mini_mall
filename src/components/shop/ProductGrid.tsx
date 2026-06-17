import type { Product, Category } from "@prisma/client";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProductGridProps {
  products: (Product & { category: Category })[];
  /** 是否处于搜索结果状态，影响空状态提示文案 */
  isFiltered?: boolean;
}

/** 商品网格 — 响应式网格布局，2/3/4 列自适应 */
export function ProductGrid({ products, isFiltered = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        }
        title="暂无商品"
        description={isFiltered ? "换个关键词试试？" : "该分类下还没有商品"}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
