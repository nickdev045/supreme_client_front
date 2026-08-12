"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { ButtonHTMLAttributes } from "react";

type SignOutButtonProps = {
  className?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  role?: ButtonHTMLAttributes<HTMLButtonElement>["role"];
};

export function SignOutButton({ className, onClick, role }: SignOutButtonProps) {
  const t = useTranslations("Nav");

  return (
    <button
      type="button"
      role={role}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        void signOut({ callbackUrl: "/" });
      }}
    >
      {t("logout")}
    </button>
  );
}
