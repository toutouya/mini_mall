"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "./DeleteButton";
import type { Product, Category } from "@prisma/client";

type ProductWithCategory = Product & { category: Category };

/** 商品管理列表页 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
        <Button href="/admin/products/new">新增商品</Button>
      </div>

      <DataTable
        data={products}
        keyAccessor={(p) => p.id}
        emptyMessage={loading ? "加载中…" : "暂无商品"}
        columns={[
          {
            header: "商品",
            accessor: (p) => (
              <div className="flex items-center gap-3">
                <span className="text-gray-900 font-medium">{p.name}</span>
              </div>
            ),
          },
          {
            header: "分类",
            accessor: (p) => <Badge variant="info">{p.category.name}</Badge>,
          },
          {
            header: "价格",
            accessor: (p) => `¥${p.price.toFixed(2)}`,
          },
          {
            header: "库存",
            accessor: (p) => (
              <span className={p.stock === 0 ? "text-red-500" : ""}>
                {p.stock}
              </span>
            ),
          },
        ]}
        actions={(p) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/products/${p.id}/edit`}
              className="text-sm text-primary hover:underline"
            >
              编辑
            </Link>
            <DeleteButton productId={p.id} productName={p.name} />
          </div>
        )}
      />
    </div>
  );
}
