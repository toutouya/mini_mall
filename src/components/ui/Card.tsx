import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** 通用卡片容器，带圆角、阴影和白色背景 */
export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}
