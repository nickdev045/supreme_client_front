"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState, type ButtonHTMLAttributes } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type SignOutConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackPath?: string;
};

export function SignOutConfirmDialog({
  open,
  onOpenChange,
  callbackPath = "/login",
}: SignOutConfirmDialogProps) {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const [pending, setPending] = useState(false);

  return (
    <ConfirmDialog
      open={open}
      title={t("logoutConfirmTitle")}
      description={t("logoutConfirmDescription")}
      confirmLabel={t("logout")}
      cancelLabel={tCommon("cancel")}
      pending={pending}
      onCancel={() => {
        if (!pending) {
          setPending(false);
          onOpenChange(false);
        }
      }}
      onConfirm={() => {
        setPending(true);
        void signOut({ callbackUrl: callbackPath, redirect: true }).catch(() => {
          setPending(false);
        });
      }}
    />
  );
}

type SignOutButtonProps = {
  className?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  role?: ButtonHTMLAttributes<HTMLButtonElement>["role"];
  callbackPath?: string;
  /** When set, the parent owns the confirm dialog (e.g. to keep it mounted outside a dropdown). */
  onRequestSignOut?: () => void;
};

export function SignOutButton({
  className,
  onClick,
  role,
  callbackPath = "/login",
  onRequestSignOut,
}: SignOutButtonProps) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        role={role}
        className={className}
        onClick={(event) => {
          event.stopPropagation();
          if (onRequestSignOut) {
            onRequestSignOut();
          } else {
            setOpen(true);
          }
          onClick?.(event);
        }}
      >
        {t("logout")}
      </button>
      {onRequestSignOut ? null : (
        <SignOutConfirmDialog open={open} onOpenChange={setOpen} callbackPath={callbackPath} />
      )}
    </>
  );
}
