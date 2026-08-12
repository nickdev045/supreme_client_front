import Link from "next/link";
import { getTranslations } from "next-intl/server";

type LandingFooterProps = {
  signedIn: boolean;
};

export async function LandingFooter({ signedIn }: LandingFooterProps) {
  const t = await getTranslations("Landing");
  const tBrand = await getTranslations("Brand");

  return (
    <footer className="mt-16 bg-[var(--navy)] py-10 text-[var(--cream)]">
      <div className="mx-auto mb-8 grid w-[min(1200px,calc(100%-2rem))] gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h4 className="mt-0 mb-3 font-[family-name:var(--font-display)] text-[0.95rem] font-bold text-[var(--cream)]">
            {tBrand("name")}
          </h4>
          <p className="m-0 text-[0.88rem] text-[var(--cream)]/85">{t("footerTagline")}</p>
        </div>
        <div>
          <h4 className="mt-0 mb-3 font-[family-name:var(--font-display)] text-[0.95rem] font-bold text-[var(--cream)]">
            {t("footerSite")}
          </h4>
          <ul className="m-0 list-none space-y-1.5 p-0 text-[0.88rem]">
            <li>
              <Link href="/" className="text-[var(--cream)]/85 hover:text-[var(--cream)]">
                {t("nav.hero")}
              </Link>
            </li>
            {signedIn ? (
              <li>
                <Link href="/shop" className="text-[var(--cream)]/85 hover:text-[var(--cream)]">
                  {t("enterShop")}
                </Link>
              </li>
            ) : (
              <li>
                <Link href="/login" className="text-[var(--cream)]/85 hover:text-[var(--cream)]">
                  {t("signIn")}
                </Link>
              </li>
            )}
            <li>
              <Link href="/request" className="text-[var(--cream)]/85 hover:text-[var(--cream)]">
                {t("becomeMember")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mt-0 mb-3 font-[family-name:var(--font-display)] text-[0.95rem] font-bold text-[var(--cream)]">
            {t("footerAccess")}
          </h4>
          <ul className="m-0 list-none space-y-1.5 p-0 text-[0.88rem]">
            <li>
              <a href="#contact" className="text-[var(--cream)]/85 hover:text-[var(--cream)]">
                {t("nav.contact")}
              </a>
            </li>
            <li>
              <a href="#about" className="text-[var(--cream)]/85 hover:text-[var(--cream)]">
                {t("nav.about")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))] border-t border-[var(--cream)]/20 pt-4 text-center text-[0.8rem] text-[var(--cream)]/75">
        {t("footerCopyright")}
      </div>
    </footer>
  );
}
