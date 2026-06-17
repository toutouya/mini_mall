import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(1, "用户名不能为空").max(50),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少需要 6 位").max(100),
});

/**
 * POST /api/auth/register
 * 注册新用户：验证邮箱唯一性 → 哈希密码 → 创建用户 → 写入 session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // 检查邮箱唯一性
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
      select: { id: true, role: true },
    });

    // 写入 session
    await setSession(user.id, user.role);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
