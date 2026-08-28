"use client";

import type { MouseEvent } from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  addFavouriteAction,
  removeFavouriteAction,
} from "@/app/(portal)/shop/favorites/actions";

type FavouriteToggleProps = {
  productId: string;
  favouriteId?: number | null;
  variant?: "card" | "detail";
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function FavouriteToggle({
  productId,
  favouriteId = null,
  variant = "card",
}: FavouriteToggleProps) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const [currentId, setCurrentId] = useState<number | null>(favouriteId);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const saved = currentId != null;

  useEffect(() => {
    setCurrentId(favouriteId ?? null);
  }, [favouriteId]);

  function onToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    setError(false);
    startTransition(async () => {
      const result = saved
        ? await removeFavouriteAction(currentId)
        : await addFavouriteAction(productId);
      if (!result.ok) {
        setError(true);
        return;
      }
      setCurrentId(result.favouriteId);
      router.refresh();
    });
  }

  const label = saved ? t("favoritesPage.remove") : t("favoritesPage.add");

  if (variant === "detail") {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={onToggle}
          disabled={pending}
          aria-pressed={saved}
          aria-label={label}
          className={[
            "inline-flex min-h-11 items-center gap-2 rounded-[10px] border-2 px-4 py-2 text-sm font-semibold transition-[color,background-color,border-color] duration-200",
            saved
              ? "border-[var(--tomato)] bg-[var(--tomato)] text-white hover:bg-white hover:text-[var(--tomato)]"
              : "border-[var(--navy)] bg-transparent text-[var(--navy)] hover:bg-[var(--navy)] hover:text-[var(--cream)]",
            pending ? "opacity-60" : "",
          ].join(" ")}
        >
          <HeartIcon filled={saved} />
          {label}
        </button>
        {error ? (
          <p className="m-0 text-[0.75rem] text-[var(--tomato)]" role="alert">
            {t("favoritesPage.error")}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="absolute top-2 right-2 z-10">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={saved}
        aria-label={label}
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-[color,background-color,border-color,transform] duration-200 hover:scale-110",
          saved
            ? "border-[var(--tomato)] bg-[var(--tomato)] text-white hover:bg-white hover:text-[var(--tomato)]"
            : "border-[#ddd] bg-white/95 text-[var(--navy)] hover:border-[var(--tomato)] hover:bg-[var(--tomato)] hover:text-white",
          pending ? "opacity-60" : "",
        ].join(" ")}
      >
        <HeartIcon filled={saved} />
      </button>
      {error ? (
        <span className="sr-only" role="alert">
          {t("favoritesPage.error")}
        </span>
      ) : null}
    </div>
  );
}
