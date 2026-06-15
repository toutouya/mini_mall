import { z } from "zod";

export const USER_ROLES = ["CUSTOMER", "ADMIN"] as const;
export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export const PAYMENT_STATUSES = ["PENDING", "PAID", "REFUNDED"] as const;

export const registerSchema = z.object({
  name: z.string().min(1, "请输入用户名").max(50),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export const productSchema = z.object({
  name: z.string().min(1, "商品名称不能为空").max(100),
  slug: z
    .string()
    .min(1, "Slug 不能为空")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小写字母、数字和连字符"),
  description: z.string().min(1, "描述不能为空").max(2000),
  price: z.coerce.number().positive("价格必须大于 0"),
  stock: z.coerce.number().int().nonnegative("库存不能为负数"),
  categoryId: z.coerce.number().int().positive("请选择分类"),
  imageUrl: z
    .string()
    .optional()
    .default("/images/placeholder.svg"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空").max(50),
  slug: z
    .string()
    .min(1, "Slug 不能为空")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小写字母、数字和连字符"),
  description: z.string().optional(),
});

export const checkoutSchema = z.object({
  shippingName: z.string().min(1, "收货人不能为空").max(50),
  shippingEmail: z.string().email("请输入有效的邮箱"),
  shippingAddr: z.string().min(1, "收货地址不能为空").max(200),
});
