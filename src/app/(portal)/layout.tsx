import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ShopShell } from "@/components/portal/shop-shell";
import { getSession } from "@/lib/session";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id || session.error) {
    redirect("/login");
  }

  const t = await getTranslations("Shop");
  const userName = session.user.name || t("userFallback");

  return (
    <ShopShell userName={userName} photoUrl={session.user.photoUrl}>
      {children}
    </ShopShell>
  );
}
