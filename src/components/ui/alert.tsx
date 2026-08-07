import type { ReactNode } from "react";

const toneClass = {
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-[var(--border)] bg-[var(--cream)] text-[var(--text)]",
} as const;

export function Alert({
  tone = "info",
  className,
  children,
}: {
  tone?: keyof typeof toneClass;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={`rounded-[10px] border px-3 py-2 text-sm ${toneClass[tone]} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
