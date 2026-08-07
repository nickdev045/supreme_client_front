"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";

/** Public-style navy header used on auth screens (matches inventario_proyecto login). */
export function SiteHeader() {
  const tBrand = useTranslations("Brand");

  return (
    <header className="sticky top-0 z-[100] bg-[var(--navy)] text-[var(--cream)] shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex w-[min(1200px,calc(100%-2rem))] items-center justify-between gap-4 py-3">
        <Link href="/login" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
            priority
          />
          <span className="font-[family-name:var(--font-display)] text-[1.15rem] font-bold tracking-wide">
            {tBrand("name")}
          </span>
        </Link>
        <LanguageSwitcher variant="dark" />
      </div>
    </header>
  );
}
