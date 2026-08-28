"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { UserAvatar } from "@/components/landing/user-avatar";
import { SignOutButton, SignOutConfirmDialog } from "@/components/portal/sign-out-button";
import { HomeIcon, LogoutIcon, OrdersIcon, UserIcon } from "@/components/ui/icons";

type UserMenuProps = {
  name: string;
  photoUrl: string | null;
  /** When true, includes a link back to the public landing page. */
  showLandingLink?: boolean;
};

export function UserMenu({ name, photoUrl, showLandingLink = false }: UserMenuProps) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="rounded-full outline-none ring-2 ring-transparent ring-offset-2 ring-offset-[var(--navy)] transition-[transform,box-shadow,filter] duration-200 hover:scale-105 hover:ring-[var(--cream)] hover:brightness-110 focus-visible:ring-[var(--cream)]"
        aria-label={t("accountMenu")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar name={name} photoUrl={photoUrl} size={40} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-[120] min-w-[200px] rounded-[10px] border border-[var(--border)] bg-white py-1 shadow-[var(--shadow)]"
        >
          <p className="truncate border-b border-[var(--border)] px-3 py-2 text-[0.8rem] font-medium text-[var(--text-muted)]">
            {name}
          </p>
          <Link
            href="/shop/profile"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-[var(--navy)] transition-colors duration-200 hover:bg-[var(--cream)]"
            onClick={() => setOpen(false)}
          >
            <UserIcon />
            {t("myProfile")}
          </Link>
          <Link
            href="/shop/orders"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-[var(--navy)] transition-colors duration-200 hover:bg-[var(--cream)]"
            onClick={() => setOpen(false)}
          >
            <OrdersIcon />
            {t("yourOrders")}
          </Link>
          {showLandingLink ? (
            <Link
              href="/"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-[var(--navy)] transition-colors duration-200 hover:bg-[var(--cream)]"
              onClick={() => setOpen(false)}
            >
              <HomeIcon />
              {t("backToLanding")}
            </Link>
          ) : null}
          <SignOutButton
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-[var(--navy)] transition-colors duration-200 hover:bg-[var(--cream)]"
            role="menuitem"
            onRequestSignOut={() => {
              setOpen(false);
              setSignOutOpen(true);
            }}
          >
            <LogoutIcon />
            {t("logout")}
          </SignOutButton>
        </div>
      ) : null}
      <SignOutConfirmDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </div>
  );
}
