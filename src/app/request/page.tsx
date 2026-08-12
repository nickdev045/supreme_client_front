import { getTranslations } from "next-intl/server";

import { RequestForm } from "@/components/portal/request-form";
import { SiteHeader } from "@/components/portal/site-header";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("requestTitle"),
    description: t("requestDescription"),
  };
}

export default function RequestPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--cream)]">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <RequestForm />
      </main>
    </div>
  );
}
