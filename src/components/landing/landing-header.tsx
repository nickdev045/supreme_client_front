"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { UserMenu } from "@/components/landing/user-menu";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { btn } from "@/components/ui/styles";

export type LandingUser = {
  name: string;
  photoUrl: string | null;
};

type LandingHeaderProps = {
  user: LandingUser | null;
};

const NAV_IDS = ["hero", "catalog", "delivery", "about", "contact"] as const;

export function LandingHeader({ user }: LandingHeaderProps) {
  const t = useTranslations("Landing");
  const tBrand = useTranslations("Brand");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const navLinks = NAV_IDS.map((id) => (
    <a
      key={id}
      href={`#${id}`}
      onClick={() => setMenuOpen(false)}
      className="block py-[0.65rem] text-[0.9rem] font-medium text-[var(--cream)]/90 transition hover:text-[var(--cream)] md:py-0"
    >
      {t(`nav.${id}`)}
    </a>
  ));

  const authActions = user ? (
    <div className="flex items-center gap-3">
      <UserMenu name={user.name} photoUrl={user.photoUrl} />
      <Link href="/shop" className={`${btn.accent} ${btn.sm}`} onClick={() => setMenuOpen(false)}>
        {t("enterShop")}
      </Link>
    </div>
  ) : (
    <Link
      href="/login"
      className={`${btn.outlineLight} ${btn.sm}`}
      onClick={() => setMenuOpen(false)}
    >
      {t("signIn")}
    </Link>
  );

  return (
    <header className="sticky top-0 z-[100] bg-[var(--navy)] text-[var(--cream)] shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
      <div className="relative mx-auto flex w-[min(1200px,calc(100%-2rem))] items-center justify-between gap-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
            priority
          />
          <span className="truncate font-[family-name:var(--font-display)] text-[1.15rem] font-bold tracking-wide max-md:text-[0.95rem]">
            {tBrand("name")}
          </span>
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--cream)]/40 text-[var(--cream)] md:hidden"
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden>{menuOpen ? "×" : "☰"}</span>
        </button>

        <div className="hidden flex-1 items-center justify-end gap-6 md:flex">
          <nav aria-label={t("navLabel")}>
            <ul className="m-0 flex list-none items-center gap-6 p-0">
              {NAV_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="text-[0.9rem] font-medium text-[var(--cream)]/90 transition hover:text-[var(--cream)]"
                  >
                    {t(`nav.${id}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="dark" />
            {authActions}
          </div>
        </div>

        {menuOpen ? (
          <div className="absolute top-full right-0 left-0 z-[110] flex flex-col gap-0 border-t border-[var(--cream)]/15 bg-[var(--navy)] px-4 pt-2 pb-4 shadow-[0_12px_28px_rgba(0,0,0,0.2)] md:hidden">
            <nav aria-label={t("navLabel")} className="flex flex-col border-b border-[var(--cream)]/10 pb-2">
              {navLinks}
            </nav>
            <div className="mt-3 flex flex-col gap-3">
              <LanguageSwitcher variant="dark" />
              <div className="flex items-center justify-between gap-3">{authActions}</div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
