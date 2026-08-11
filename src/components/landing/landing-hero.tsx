import { getTranslations } from "next-intl/server";

export async function LandingHero() {
  const t = await getTranslations("Landing");

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[linear-gradient(135deg,var(--navy)_0%,var(--navy-light)_55%,#2d4a6e_100%)] px-0 py-16 text-[var(--cream)] md:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[-5%] h-[280px] w-[280px] -translate-y-1/2 bg-[url('/logo.png')] bg-contain bg-center bg-no-repeat opacity-[0.12]"
      />
      <div className="relative mx-auto w-[min(1200px,calc(100%-2rem))]">
        <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] font-bold text-[var(--cream)]">
          {t("heroTitle")}
        </h1>
        <p className="mt-4 mb-0 max-w-[520px] text-[1.1rem] text-[var(--cream)]/92">
          {t("heroSubtitle")}
        </p>
      </div>
    </section>
  );
}
