import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

/** 登录页面 — Suspense 边界包裹 useSearchParams */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
