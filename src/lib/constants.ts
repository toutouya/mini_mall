/** 订单状态对应的 Badge 颜色和文案 */
export const ORDER_STATUS_MAP: Record<
  string,
  { variant: "info" | "warning" | "success" | "default" | "danger"; label: string }
> = {
  PENDING: { variant: "warning", label: "待付款" },
  CONFIRMED: { variant: "info", label: "已支付" },
  SHIPPED: { variant: "info", label: "已发货" },
  DELIVERED: { variant: "success", label: "已完成" },
  CANCELLED: { variant: "danger", label: "已取消" },
};
