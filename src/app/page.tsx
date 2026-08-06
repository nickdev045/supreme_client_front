import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("Home");
  const brand = await getTranslations("Brand");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--navy)]">
        {brand("name")}
      </p>
      <h1 className="mt-4 text-xl text-[var(--text)]">{t("title")}</h1>
      <p className="mt-2 text-[var(--text-muted)]">{t("subtitle")}</p>
    </main>
  );
}
