import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/components/portal/login-form";
import { LoginFormFallback } from "@/components/portal/login-form-fallback";
import { SiteHeader } from "@/components/portal/site-header";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("loginTitle"),
    description: t("loginDescription"),
  };
}

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--cream)]">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
