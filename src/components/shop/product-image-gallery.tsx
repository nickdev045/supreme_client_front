"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type ProductImageGalleryProps = {
  images: string[];
  name: string;
};

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const t = useTranslations("Shop");
  const [selected, setSelected] = useState(0);
  const current = images[selected] ?? null;

  if (!current) {
    return (
      <div className="flex aspect-square min-h-[16rem] items-center justify-center rounded-[14px] bg-[var(--shop-surface-muted)] text-[var(--navy)]">
        <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold">
          {name.trim().charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[14px] bg-[var(--shop-surface-muted)]">
        {/* Product image hosts vary by upload/CDN config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={name}
          className="aspect-square w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <ul
          className="m-0 flex list-none flex-wrap gap-2 p-0"
          aria-label={t("productPage.gallery")}
        >
          {images.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                aria-label={t("productPage.imageN", { n: index + 1 })}
                aria-pressed={index === selected}
                className={[
                  "h-16 w-16 overflow-hidden rounded-[10px] border-2 p-0",
                  index === selected
                    ? "border-[var(--navy)]"
                    : "border-transparent",
                ].join(" ")}
                onClick={() => setSelected(index)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
