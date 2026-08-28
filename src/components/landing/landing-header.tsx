"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { UserMenu } from "@/components/landing/user-menu";
import { btn } from "@/components/ui/styles";

export type LandingUser = {
  name: string;
  photoUrl: string | null;
};

type LandingHeaderProps = {
  user: LandingUser | null;
};

const NAV_IDS = ["hero", "catalog", "delivery", "about", "contact"] as const;

const navLinkClassName =
  "inline-flex min-h-11 cursor-pointer items-center rounded-md border border-transparent px-3 text-[0.9rem] font-medium text-[var(--cream)]/90 transition-[color,background-color,border-color] duration-200 hover:border-[var(--cream)] hover:bg-[var(--cream)]/10 hover:text-[var(--cream)] focus-visible:border-[var(--cream)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cream)]";

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
    <>
      <header className="sticky top-0 z-[130] bg-[var(--navy)] text-[var(--cream)] shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
        <div className="mx-auto flex w-[min(1200px,calc(100%-2rem))] items-center gap-3 py-3 md:justify-between md:gap-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--cream)]/40 text-[var(--cream)] md:hidden"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden>{menuOpen ? "×" : "☰"}</span>
          </button>

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

          <div className="ml-auto hidden flex-1 items-center justify-end gap-6 md:flex">
            <nav aria-label={t("navLabel")}>
              <ul className="m-0 flex list-none items-center gap-2 p-0">
                {NAV_IDS.map((id) => (
                  <li key={id}>
                    <a href={`#${id}`} className={navLinkClassName}>
                      {t(`nav.${id}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-3">{authActions}</div>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <button
          type="button"
          aria-label={t("closeMenu")}
          className="fixed inset-0 z-[110] bg-black/45 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div
        id="landing-mobile-menu"
        className={[
          "fixed inset-y-0 left-0 z-[120] flex w-[min(100vw,16rem)] flex-col bg-[var(--navy)] pt-[4.75rem] text-[var(--cream)] shadow-[4px_0_24px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out md:hidden",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-hidden={!menuOpen}
      >
        <nav aria-label={t("navLabel")} className="flex flex-col gap-1 px-4 pt-2 pb-2">
          {NAV_IDS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}
              className={`${navLinkClassName} w-full`}
            >
              {t(`nav.${id}`)}
            </a>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-[var(--cream)]/15 px-4 py-4">
          <div className="flex items-center justify-between gap-3">{authActions}</div>
        </div>
      </div>
    </>
  );
}
