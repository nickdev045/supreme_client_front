import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense, type ReactNode } from "react";

import { ShopShell } from "@/components/portal/shop-shell";
import { cartItemCount, listStoreCarts } from "@/lib/api/cart";
import { getAccessToken, getSession } from "@/lib/session";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id || session.error) {
    redirect("/login");
  }

  const t = await getTranslations("Shop");
  const userName = session.user.name || t("userFallback");
  const token = await getAccessToken();
  let cartCount = 0;
  if (token) {
    try {
      const carts = await listStoreCarts(token);
      cartCount = cartItemCount(carts[0] ?? null);
    } catch {
      cartCount = 0;
    }
  }

  return (
    <Suspense fallback={<div className="min-h-full flex-1 bg-[var(--shop-surface)]" />}>
      <ShopShell userName={userName} photoUrl={session.user.photoUrl} cartCount={cartCount}>
        {children}
      </ShopShell>
    </Suspense>
  );
}
