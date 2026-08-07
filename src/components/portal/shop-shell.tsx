"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import { SignOutButton } from "@/components/portal/sign-out-button";

type ShopShellProps = {
  userName: string;
  children: ReactNode;
};

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

/** Shop chrome from inventario_proyecto (Amazon / Mercado Libre style). */
export function ShopShell({ userName, children }: ShopShellProps) {
  const t = useTranslations("Shop");
  const tBrand = useTranslations("Brand");
  const [menuOpen, setMenuOpen] = useState(false);
  const firstName = userName.split(/\s+/)[0] || userName;

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

  function onSearchSubmit(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--shop-surface)]">
      <header className="sticky top-0 z-[100] bg-[var(--navy)] text-[var(--cream)] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <div className="mx-auto flex w-[min(1400px,calc(100%-2rem))] items-center gap-3 py-[0.65rem]">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/35 text-[var(--cream)] md:hidden"
            aria-label={t("openMenu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span aria-hidden>☰</span>
          </button>

          <Link href="/" className="flex max-w-[180px] shrink-0 items-center gap-2 text-[var(--cream)]">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
              priority
            />
            <span className="hidden font-[family-name:var(--font-display)] text-[0.85rem] font-bold leading-tight sm:block">
              {tBrand("name")}
            </span>
          </Link>

          <form
            className="flex min-w-0 flex-1 overflow-hidden rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
            role="search"
            onSubmit={onSearchSubmit}
          >
            <input
              type="search"
              name="q"
              disabled
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              className="min-w-0 flex-1 border-0 bg-[var(--shop-surface)] px-[0.85rem] py-[0.6rem] text-[0.9rem] text-[var(--text)] outline-none disabled:cursor-not-allowed disabled:opacity-80"
            />
            <button
              type="submit"
              disabled
              className="shrink-0 whitespace-nowrap border-0 bg-[var(--carrot)] px-[1.1rem] text-[0.88rem] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-80"
            >
              {t("search")}
            </button>
          </form>

          <div className="hidden shrink-0 items-stretch gap-[0.35rem] md:flex">
            <div className="flex flex-col justify-center rounded px-[0.6rem] py-[0.35rem] text-[0.78rem] leading-tight text-[var(--cream)]">
              <span className="opacity-85">{t("helloName", { name: firstName })}</span>
              <span className="text-[0.85rem] font-bold">{t("account")}</span>
            </div>
            <div className="flex flex-col justify-center rounded px-[0.6rem] py-[0.35rem] text-[0.78rem] leading-tight text-[var(--cream)] opacity-70">
              <span className="opacity-85">{t("returns")}</span>
              <span className="text-[0.85rem] font-bold">{t("orders")}</span>
            </div>
            <div
              className="relative flex flex-col items-center justify-center gap-[0.1rem] rounded px-[0.6rem] py-[0.35rem] text-[var(--cream)] opacity-70"
              aria-label={t("cart")}
            >
              <span className="relative inline-flex">
                <CartIcon className="h-[26px] w-[26px]" />
                <span className="absolute -top-1.5 -right-2.5 inline-flex h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded-full border-2 border-[var(--navy)] bg-[var(--carrot)] px-[0.3rem] text-[0.75rem] font-bold text-white">
                  0
                </span>
              </span>
              <span className="text-[0.85rem] font-bold">{t("cart")}</span>
            </div>
          </div>

          <div
            className="relative inline-flex shrink-0 items-center justify-center p-[0.35rem] text-[var(--cream)] opacity-70 md:hidden"
            aria-label={t("cart")}
          >
            <CartIcon className="h-7 w-7" />
            <span className="absolute -top-0.5 -right-0.5 inline-flex h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded-full border-2 border-[var(--navy)] bg-[var(--carrot)] px-[0.3rem] text-[0.75rem] font-bold text-white">
              0
            </span>
          </div>
        </div>

        <nav
          className="mx-auto hidden w-[min(1400px,calc(100%-2rem))] gap-1 overflow-x-auto pb-[0.55rem] md:flex"
          aria-label={t("categories")}
        >
          <span className="whitespace-nowrap rounded bg-white/12 px-3 py-[0.35rem] text-[0.85rem] font-medium text-[var(--cream)]">
            {t("allProducts")}
          </span>
          <span className="whitespace-nowrap rounded px-3 py-[0.35rem] text-[0.85rem] font-medium text-[var(--cream)] opacity-70">
            {t("recommended")}
          </span>
          <span className="whitespace-nowrap rounded px-3 py-[0.35rem] text-[0.85rem] font-medium text-[var(--cream)] opacity-70">
            {t("favorites")}
          </span>
          <span className="whitespace-nowrap rounded px-3 py-[0.35rem] text-[0.85rem] font-medium text-[var(--cream)] opacity-70">
            {t("buyAgain")}
          </span>
        </nav>
      </header>

      {menuOpen ? (
        <button
          type="button"
          aria-label={t("closeMenu")}
          className="fixed inset-0 z-[200] bg-black/45 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <div
        id="shop-mobile-menu"
        className={[
          "fixed inset-y-0 left-0 z-[210] flex w-[min(300px,88vw)] flex-col overflow-hidden bg-[var(--shop-surface)] text-[var(--text)] shadow-[4px_0_20px_rgba(0,0,0,0.15)] md:hidden",
          menuOpen ? "flex" : "hidden",
        ].join(" ")}
        aria-hidden={!menuOpen}
      >
        <div className="relative bg-gradient-to-b from-[var(--navy)] to-[var(--navy-light)] px-4 pt-5 pb-4 text-[var(--cream)]">
          <p className="m-0 text-base">
            {t("hello")}, <strong>{firstName}</strong>
          </p>
          <button
            type="button"
            className="absolute top-[0.65rem] right-[0.65rem] flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/15 text-[1.4rem] leading-none text-[var(--cream)]"
            aria-label={t("closeMenu")}
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto py-2">
          <p className="mt-4 mb-[0.35rem] px-4 text-[0.72rem] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            {t("yourAccount")}
          </p>
          <ul className="m-0 list-none p-0">
            <li>
              <span className="block border-b border-[var(--border)] px-5 py-3 text-[0.95rem] font-medium opacity-60">
                {t("accountSettings")}
              </span>
            </li>
            <li>
              <span className="block border-b border-[var(--border)] px-5 py-3 text-[0.95rem] font-medium opacity-60">
                {t("yourOrders")}
              </span>
            </li>
            <li>
              <span className="block border-b border-[var(--border)] px-5 py-3 text-[0.95rem] font-medium opacity-60">
                {t("notifications")}
              </span>
            </li>
          </ul>
          <p className="mt-4 mb-[0.35rem] px-4 text-[0.72rem] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            {t("browse")}
          </p>
          <ul className="m-0 list-none p-0">
            <li>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block border-b border-[var(--border)] px-5 py-3 text-[0.95rem] font-medium text-[var(--text)]"
              >
                {t("home")}
              </Link>
            </li>
          </ul>
          <ul className="m-0 list-none p-0">
            <li className="px-4 py-3">
              <SignOutButton className="w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-left text-sm font-medium text-[var(--navy)]" />
            </li>
          </ul>
        </div>
      </div>

      <main className="mx-auto w-[min(1400px,calc(100%-2rem))] flex-1 px-0 pt-4 pb-20 md:pb-6">
        {children}
      </main>

      <nav
        className="fixed right-0 bottom-0 left-0 z-[95] flex items-stretch justify-around border-t border-[var(--border)] bg-[var(--shop-surface)] pt-[0.35rem] pb-[calc(0.35rem+env(safe-area-inset-bottom,0))] shadow-[0_-2px_12px_rgba(0,0,0,0.08)] md:hidden"
        aria-label={t("mobileNav")}
      >
        <Link
          href="/"
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] px-1 py-[0.35rem] text-[0.65rem] font-semibold text-[var(--navy)]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(26,43,76,0.1)] text-[0.85rem] font-bold">
            H
          </span>
          <span>{t("home")}</span>
        </Link>
        <span className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] px-1 py-[0.35rem] text-[0.65rem] font-semibold text-[var(--text-muted)] opacity-60">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[0.85rem] font-bold">
            F
          </span>
          <span>{t("favorites")}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] px-1 py-[0.35rem] text-[0.65rem] font-semibold text-[var(--text-muted)] opacity-60">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[0.85rem] font-bold">
            A
          </span>
          <span>{t("alerts")}</span>
        </span>
        <span className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] px-1 py-[0.35rem] text-[0.65rem] font-semibold text-[var(--text-muted)] opacity-60">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg">
            <CartIcon className="h-[22px] w-[22px]" />
          </span>
          <span>{t("cart")}</span>
        </span>
        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] border-0 bg-transparent px-1 py-[0.35rem] text-[0.65rem] font-semibold text-[var(--text-muted)]"
          onClick={() => setMenuOpen(true)}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[0.85rem] font-bold">
            ☰
          </span>
          <span>{t("menu")}</span>
        </button>
      </nav>
    </div>
  );
}
