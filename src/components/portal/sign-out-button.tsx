"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ButtonHTMLAttributes } from "react";
import { createPortal } from "react-dom";

import { ConfirmModal } from "@/components/ui/confirm-modal";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) setPending(false);
  }, [open]);

  const modal = (
    <ConfirmModal
      open={open}
      title={t("logoutConfirmTitle")}
      description={t("logoutConfirmDescription")}
      confirmLabel={t("logout")}
      cancelLabel={tCommon("cancel")}
      pending={pending}
      onCancel={() => {
        if (!pending) onOpenChange(false);
      }}
      onConfirm={() => {
        setPending(true);
        void signOut({ callbackUrl: callbackPath, redirect: true }).catch(() => {
          setPending(false);
        });
      }}
    />
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
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
