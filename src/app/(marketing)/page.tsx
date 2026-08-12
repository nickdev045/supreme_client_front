import { getTranslations } from "next-intl/server";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingSections } from "@/components/landing/landing-sections";
import { getSession } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("landingTitle"),
    description: t("landingDescription"),
  };
}

export default async function LandingPage() {
  const session = await getSession();
  const signedIn = Boolean(session?.user?.id && !session.error);
  const user =
    signedIn && session?.user
      ? {
          name: session.user.name || session.user.email || "?",
          photoUrl: session.user.photoUrl,
        }
      : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--cream)]">
      <LandingHeader user={user} />
      <main className="flex-1">
        <LandingHero />
        <LandingSections />
      </main>
      <LandingFooter signedIn={signedIn} />
    </div>
  );
}
