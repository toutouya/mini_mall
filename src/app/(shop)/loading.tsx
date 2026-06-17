import { Spinner } from "@/components/ui/Spinner";

/** 商城页面加载骨架屏 */
export default function ShopLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
