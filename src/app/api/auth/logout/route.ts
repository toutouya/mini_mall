import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * 清除 session cookie，退出登录
 */
export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}
