"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function SignOutButton({ className }: { className?: string }) {
  const t = useTranslations("Nav");

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className}
    >
      {t("logout")}
    </button>
  );
}
