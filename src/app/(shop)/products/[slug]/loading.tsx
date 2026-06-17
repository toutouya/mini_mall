import { Spinner } from "@/components/ui/Spinner";

/** 商品详情页加载状态 */
export default function ProductDetailLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
