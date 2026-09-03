import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { StoreTermsAcceptClient } from "@/components/portal/terms-accept-client";
import { listPendingTerms } from "@/lib/api/terms";
import { getAccessToken } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations("Terms");
  return { title: t("acceptTitle") };
}

export default async function StoreTermsAcceptPage() {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  const pending = await listPendingTerms(token);
  if (pending.data.length === 0) {
    redirect("/shop");
  }

  return <StoreTermsAcceptClient pending={pending.data} />;
}
