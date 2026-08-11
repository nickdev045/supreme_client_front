"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import { UserAvatar } from "@/components/landing/user-avatar";
import { SignOutButton } from "@/components/portal/sign-out-button";

type UserMenuProps = {
  name: string;
  photoUrl: string | null;
};

export function UserMenu({ name, photoUrl }: UserMenuProps) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
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
        className="rounded-full outline-none ring-offset-2 ring-offset-[var(--navy)] focus-visible:ring-2 focus-visible:ring-[var(--cream)]"
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
          className="absolute top-[calc(100%+0.5rem)] right-0 z-[120] min-w-[180px] rounded-[10px] border border-[var(--border)] bg-white py-1 shadow-[var(--shadow)]"
        >
          <p className="truncate border-b border-[var(--border)] px-3 py-2 text-[0.8rem] font-medium text-[var(--text-muted)]">
            {name}
          </p>
          <SignOutButton
            className="w-full px-3 py-2.5 text-left text-sm font-medium text-[var(--navy)] transition hover:bg-[var(--cream)]"
            role="menuitem"
            onClick={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
