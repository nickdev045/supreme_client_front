"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import { UserAvatar } from "@/components/landing/user-avatar";
import { UserMenu } from "@/components/landing/user-menu";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ShopNotificationBell } from "@/components/portal/notification-bell";
import { SignOutButton, SignOutConfirmDialog } from "@/components/portal/sign-out-button";

type ShopShellProps = {
  userName: string;
  photoUrl: string | null;
  cartCount?: number;
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

function ProfileIcon({ className }: { className?: string }) {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
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
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
    </svg>
  );
}

function HeartNavIcon({ className }: { className?: string }) {
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function navLinkClass(active: boolean) {
  return [
    "whitespace-nowrap rounded px-3 py-[0.35rem] text-[0.85rem] font-medium text-[var(--cream)]",
    active ? "bg-white/12" : "opacity-80 hover:opacity-100",
  ].join(" ");
}

export function ShopShell({ userName, photoUrl, cartCount = 0, children }: ShopShellProps) {
  const t = useTranslations("Shop");
  const tBrand = useTranslations("Brand");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const firstName = userName.split(/\s+/)[0] || userName;

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (!profileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [profileOpen]);

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) next.set("q", trimmed);
    if (pathname.startsWith("/shop")) {
      const orderBy = searchParams.get("orderBy");
      const sort = searchParams.get("sort");
      if (orderBy) next.set("orderBy", orderBy);
      if (sort) next.set("sort", sort);
    }
    const qs = next.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--shop-surface)]">
      <header className="sticky top-0 z-[100] bg-[var(--navy)] text-[var(--cream)] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <div className="mx-auto flex w-[min(1400px,calc(100%-1rem))] items-center gap-2 py-[0.65rem] sm:w-[min(1400px,calc(100%-2rem))] md:gap-3">
          <Link
            href="/shop"
            className="flex shrink-0 items-center gap-2 text-[var(--cream)]"
            aria-label={tBrand("name")}
          >
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
              priority
            />
            <span className="hidden whitespace-nowrap font-[family-name:var(--font-display)] text-[0.9rem] font-bold leading-tight md:inline">
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
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              className="min-w-0 flex-1 border-0 bg-[var(--shop-surface)] px-3 py-2.5 text-base text-[var(--text)] outline-none sm:px-[0.85rem] sm:text-[0.9rem]"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center border-0 bg-[var(--carrot)] px-3 text-[0.85rem] font-semibold text-white transition hover:brightness-105 sm:px-[1.1rem] sm:text-[0.88rem]"
            >
              <SearchIcon className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:inline">{t("search")}</span>
              <span className="sr-only sm:hidden">{t("search")}</span>
            </button>
          </form>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <LanguageSwitcher variant="dark" />
            <UserMenu name={userName} photoUrl={photoUrl} showLandingLink />
            <ShopNotificationBell />
            <Link
              href="/shop/orders"
              className={[
                "flex flex-col justify-center rounded px-[0.6rem] py-[0.35rem] text-[0.78rem] leading-tight text-[var(--cream)]",
                pathname.startsWith("/shop/orders") ? "bg-white/12" : "opacity-90 hover:opacity-100",
              ].join(" ")}
            >
              <span className="opacity-85">{t("returns")}</span>
              <span className="text-[0.85rem] font-bold">{t("orders")}</span>
            </Link>
            <Link
              href="/shop/cart"
              className={[
                "relative flex flex-col items-center justify-center gap-[0.1rem] rounded px-[0.6rem] py-[0.35rem] text-[var(--cream)]",
                pathname.startsWith("/shop/cart") ? "" : "opacity-90 hover:opacity-100",
              ].join(" ")}
              aria-label={t("cart")}
            >
              <span className="relative inline-flex">
                <CartIcon className="h-[26px] w-[26px]" />
                <span className="absolute -top-1.5 -right-2.5 inline-flex h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded-full border-2 border-[var(--navy)] bg-[var(--carrot)] px-[0.3rem] text-[0.75rem] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              </span>
              <span className="text-[0.85rem] font-bold">{t("cart")}</span>
            </Link>
          </div>
        </div>

        <nav
          className="mx-auto flex w-[min(1400px,calc(100%-1rem))] gap-1 overflow-x-auto pb-[0.55rem] sm:w-[min(1400px,calc(100%-2rem))]"
          aria-label={t("categories")}
        >
          <Link href="/shop" className={navLinkClass(pathname === "/shop")}>
            {t("allProducts")}
          </Link>
          <Link
            href="/shop#recommended"
            className={navLinkClass(false)}
          >
            {t("recommended")}
          </Link>
          <Link
            href="/shop/favorites"
            className={navLinkClass(pathname.startsWith("/shop/favorites"))}
          >
            {t("favorites")}
          </Link>
          <Link
            href="/shop/orders"
            className={navLinkClass(pathname.startsWith("/shop/orders"))}
          >
            {t("buyAgain")}
          </Link>
        </nav>
      </header>

      {profileOpen ? (
        <button
          type="button"
          aria-label={t("closeMenu")}
          className="fixed inset-0 z-[200] bg-black/45 md:hidden"
          onClick={() => setProfileOpen(false)}
        />
      ) : null}

      <div
        id="shop-mobile-profile"
        className={[
          "fixed inset-x-0 bottom-0 z-[210] max-h-[min(70vh,calc(100dvh-5rem))] overflow-hidden rounded-t-[16px] bg-[var(--shop-surface)] pb-[env(safe-area-inset-bottom,0)] text-[var(--text)] shadow-[0_-8px_28px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 ease-out md:hidden",
          profileOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none invisible translate-y-full opacity-0",
        ].join(" ")}
        aria-hidden={!profileOpen}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] bg-gradient-to-b from-[var(--navy)] to-[var(--navy-light)] px-4 py-4 text-[var(--cream)]">
          <UserAvatar name={userName} photoUrl={photoUrl} size={44} />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-base font-semibold">{userName}</p>
            <p className="m-0 truncate text-sm opacity-80">
              {t("hello")}, {firstName}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0 bg-white/15 text-[1.4rem] leading-none text-[var(--cream)]"
            aria-label={t("closeMenu")}
            onClick={() => setProfileOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto py-2">
          <ul className="m-0 list-none p-0">
            <li>
              <Link
                href="/shop/profile"
                onClick={() => setProfileOpen(false)}
                className="block border-b border-[var(--border)] px-5 py-3 text-[0.95rem] font-medium text-[var(--text)]"
              >
                {t("accountSettings")}
              </Link>
            </li>
            <li>
              <Link
                href="/shop/orders"
                onClick={() => setProfileOpen(false)}
                className="block border-b border-[var(--border)] px-5 py-3 text-[0.95rem] font-medium text-[var(--text)]"
              >
                {t("yourOrders")}
              </Link>
            </li>
            <li>
              <Link
                href="/shop/favorites"
                onClick={() => setProfileOpen(false)}
                className="block border-b border-[var(--border)] px-5 py-3 text-[0.95rem] font-medium text-[var(--text)]"
              >
                {t("favorites")}
              </Link>
            </li>
            <li>
              <Link
                href="/"
                onClick={() => setProfileOpen(false)}
                className="block border-b border-[var(--border)] px-5 py-3 text-[0.95rem] font-medium text-[var(--text)]"
              >
                {t("landing")}
              </Link>
            </li>
            <li className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
              <span className="text-[0.95rem] font-medium text-[var(--text)]">{t("language")}</span>
              <LanguageSwitcher variant="light" />
            </li>
            <li className="px-4 py-3">
              <SignOutButton
                className="w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-left text-sm font-medium text-[var(--navy)]"
                onRequestSignOut={() => {
                  setProfileOpen(false);
                  setSignOutOpen(true);
                }}
              />
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
          href="/shop"
          className={[
            "flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] px-0.5 py-[0.35rem] text-[0.6rem] font-semibold",
            pathname === "/shop" ? "text-[var(--navy)]" : "text-[var(--text-muted)]",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-7 w-7 items-center justify-center rounded-lg",
              pathname === "/shop" ? "bg-[rgba(26,43,76,0.1)]" : "",
            ].join(" ")}
          >
            <HomeIcon className="h-[20px] w-[20px]" />
          </span>
          <span className="truncate">{t("home")}</span>
        </Link>
        <Link
          href="/shop/favorites"
          className={[
            "flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] px-0.5 py-[0.35rem] text-[0.6rem] font-semibold",
            pathname.startsWith("/shop/favorites") ? "text-[var(--navy)]" : "text-[var(--text-muted)]",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-7 w-7 items-center justify-center rounded-lg",
              pathname.startsWith("/shop/favorites") ? "bg-[rgba(26,43,76,0.1)]" : "",
            ].join(" ")}
          >
            <HeartNavIcon className="h-[20px] w-[20px]" />
          </span>
          <span className="truncate">{t("favorites")}</span>
        </Link>
        <Link
          href="/shop/cart"
          className={[
            "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] px-0.5 py-[0.35rem] text-[0.6rem] font-semibold",
            pathname.startsWith("/shop/cart") ? "text-[var(--navy)]" : "text-[var(--text-muted)]",
          ].join(" ")}
        >
          <span
            className={[
              "relative flex h-9 w-9 items-center justify-center rounded-full",
              pathname.startsWith("/shop/cart")
                ? "bg-[var(--navy)] text-[var(--cream)]"
                : "bg-[var(--carrot)] text-white",
            ].join(" ")}
          >
            <CartIcon className="h-[20px] w-[20px]" />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[var(--shop-surface)] bg-[var(--navy)] px-1 text-[0.6rem] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </span>
          <span className="truncate">{t("cart")}</span>
        </Link>
        <ShopNotificationBell variant="mobile" />
        <button
          type="button"
          className={[
            "flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] border-0 bg-transparent px-0.5 py-[0.35rem] text-[0.6rem] font-semibold",
            profileOpen ? "text-[var(--navy)]" : "text-[var(--text-muted)]",
          ].join(" ")}
          aria-expanded={profileOpen}
          aria-controls="shop-mobile-profile"
          onClick={() => setProfileOpen((open) => !open)}
        >
          <span
            className={[
              "flex h-7 w-7 items-center justify-center rounded-lg",
              profileOpen ? "bg-[rgba(26,43,76,0.1)]" : "",
            ].join(" ")}
          >
            <ProfileIcon className="h-[22px] w-[22px]" />
          </span>
          <span>{t("account")}</span>
        </button>
      </nav>

      <SignOutConfirmDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </div>
  );
}
