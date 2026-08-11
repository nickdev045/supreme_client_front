import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { btn, fieldClass, labelClass } from "@/components/ui/styles";

const SAMPLE_PRODUCTS = [
  { emoji: "🍅", nameKey: "romaTomatoes", metaKey: "romaTomatoesMeta" },
  { emoji: "🥕", nameKey: "babyCarrots", metaKey: "babyCarrotsMeta" },
  { emoji: "🍆", nameKey: "italianEggplant", metaKey: "italianEggplantMeta" },
  { emoji: "🥬", nameKey: "romaineHearts", metaKey: "romaineHeartsMeta" },
  { emoji: "🍌", nameKey: "bananas", metaKey: "bananasMeta" },
  { emoji: "🍐", nameKey: "bartlettPears", metaKey: "bartlettPearsMeta" },
] as const;

const DELIVERY_ZONES = [
  { titleKey: "zoneATitle", metaKey: "zoneAMeta" },
  { titleKey: "zoneBTitle", metaKey: "zoneBMeta" },
  { titleKey: "zoneCTitle", metaKey: "zoneCMeta" },
] as const;

type LandingSectionsProps = {
  signedIn: boolean;
};

export async function LandingSections({ signedIn }: LandingSectionsProps) {
  const t = await getTranslations("Landing");

  return (
    <>
      <section id="catalog" className="bg-white py-14">
        <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
          <div className="mb-8 text-center">
            <h2 className="m-0 font-[family-name:var(--font-display)] text-[1.85rem] font-bold text-[var(--navy)]">
              {t("catalogTitle")}
            </h2>
            <p className="mx-auto mt-2 mb-0 max-w-[560px] text-[var(--text-muted)]">
              {t("catalogSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {SAMPLE_PRODUCTS.map((product) => (
              <article
                key={product.nameKey}
                className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-white transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
              >
                <div className="flex h-[140px] items-center justify-center bg-[linear-gradient(145deg,var(--cream)_0%,var(--cream-dark)_100%)] text-5xl">
                  <span aria-hidden>{product.emoji}</span>
                </div>
                <div className="p-4">
                  <h3 className="m-0 text-base font-semibold text-[var(--navy)]">
                    {t(`products.${product.nameKey}`)}
                  </h3>
                  <p className="mt-1 mb-0 text-[0.8rem] text-[var(--text-muted)]">
                    {t(`products.${product.metaKey}`)}
                  </p>
                  <p className="mt-2 mb-0 text-[0.8rem] font-normal text-[var(--text-muted)]">
                    {t("signInForPrice")}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 mb-0 text-center">
            {signedIn ? (
              <Link href="/shop" className={btn.primary}>
                {t("enterShop")}
              </Link>
            ) : (
              <Link href="/login" className={btn.primary}>
                {t("signInForPricesCta")}
              </Link>
            )}
          </p>
        </div>
      </section>

      <section id="delivery" className="py-14">
        <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
          <div className="mb-8 text-center">
            <h2 className="m-0 font-[family-name:var(--font-display)] text-[1.85rem] font-bold text-[var(--navy)]">
              {t("deliveryTitle")}
            </h2>
            <p className="mx-auto mt-2 mb-0 max-w-[560px] text-[var(--text-muted)]">
              {t("deliverySubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {DELIVERY_ZONES.map((zone) => (
              <div
                key={zone.titleKey}
                className="rounded-[14px] border border-[var(--border)] bg-white p-5"
              >
                <h3 className="m-0 text-base font-semibold text-[var(--navy)]">
                  {t(`delivery.${zone.titleKey}`)}
                </h3>
                <p className="mt-2 mb-0 text-[0.9rem] text-[var(--text-muted)]">
                  {t(`delivery.${zone.metaKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-14">
        <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
          <div className="mb-8 text-center">
            <h2 className="m-0 font-[family-name:var(--font-display)] text-[1.85rem] font-bold text-[var(--navy)]">
              {t("aboutTitle")}
            </h2>
            <p className="mx-auto mt-2 mb-0 max-w-[560px] text-[var(--text-muted)]">
              {t("aboutSubtitle")}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[14px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
              <h3 className="mt-0 mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--navy)]">
                {t("ourStoryTitle")}
              </h3>
              <p className="m-0 text-[var(--text-muted)]">{t("ourStoryBody")}</p>
            </div>
            <div className="rounded-[14px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
              <h3 className="mt-0 mb-3 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--navy)]">
                {t("whyUsTitle")}
              </h3>
              <ul className="m-0 list-disc space-y-2 pl-5 text-[var(--text-muted)]">
                <li>{t("whyUs.item1")}</li>
                <li>{t("whyUs.item2")}</li>
                <li>{t("whyUs.item3")}</li>
                <li>{t("whyUs.item4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-14">
        <div className="mx-auto w-[min(1200px,calc(100%-2rem))]">
          <div className="mb-8 text-center">
            <h2 className="m-0 font-[family-name:var(--font-display)] text-[1.85rem] font-bold text-[var(--navy)]">
              {t("contactTitle")}
            </h2>
            <p className="mx-auto mt-2 mb-0 max-w-[560px] text-[var(--text-muted)]">
              {t("contactSubtitle")}
            </p>
          </div>
          <div className="mx-auto max-w-[560px] rounded-[14px] border border-[var(--border)] bg-white shadow-[var(--shadow)]">
            <div className="space-y-4 p-5">
              <div>
                <label htmlFor="contact-name" className={labelClass}>
                  {t("contactName")}
                </label>
                <input
                  id="contact-name"
                  className={fieldClass}
                  type="text"
                  placeholder={t("contactNamePlaceholder")}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelClass}>
                  {t("contactEmail")}
                </label>
                <input
                  id="contact-email"
                  className={fieldClass}
                  type="email"
                  placeholder={t("contactEmailPlaceholder")}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  {t("contactMessage")}
                </label>
                <textarea
                  id="contact-message"
                  className={fieldClass}
                  rows={4}
                  placeholder={t("contactMessagePlaceholder")}
                  disabled
                />
              </div>
              <button type="button" className={`${btn.primary}`} disabled>
                {t("contactSendPreview")}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
