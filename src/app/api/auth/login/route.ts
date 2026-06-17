import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

/**
 * POST /api/auth/login
 * 登录：查找用户 → 验证密码 → 写入 session
 * 防撞库：无论"用户不存在"还是"密码错误"，统一返回相同错误信息
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // 查找用户（只取需要的字段）
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, role: true },
    });

    // 防撞库：用户不存在和密码错误统一返回
    if (!user) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 写入 session
    await setSession(user.id, user.role);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
