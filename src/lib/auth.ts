import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const TOKEN_NAME = "session_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 天（秒）
const BCRYPT_ROUNDS = 12;

// ========== 密码工具 ==========

/** 使用 bcryptjs 对明文密码做哈希 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** 验证明文密码是否匹配哈希 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ========== Token 工具 ==========

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

/** 签发 JWT */
async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${Math.floor(TOKEN_MAX_AGE / 3600)}h`)
    .sign(JWT_SECRET);
}

/** 验证 JWT，失败返回 null */
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify<TokenPayload>(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// ========== Session 管理 ==========

/** 把用户信息写入 httpOnly Cookie */
export async function setSession(userId: number, role: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) throw new Error("用户不存在");

  const token = await signToken({ userId, email: user.email, role });
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });

  return token;
}

/** 从 Cookie 读取当前用户信息（仅 JWT payload） */
export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;

  return verifyToken(token);
}

/** 获取当前登录用户的完整数据库信息 */
export async function getCurrentUser(): Promise<Omit<User, "password"> | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) return null;

  // 不暴露密码字段
  const { password: _, ...safeUser } = user;
  return safeUser;
}

/** 清除 Cookie，即退出登录 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}
