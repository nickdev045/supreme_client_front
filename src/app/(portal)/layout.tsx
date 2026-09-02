import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense, type ReactNode } from "react";

import { ShopShell } from "@/components/portal/shop-shell";
import { cartItemCount, listStoreCarts } from "@/lib/api/cart";
import { handleUnauthorized } from "@/lib/handle-unauthorized";
import { getAccessToken, getSession } from "@/lib/session";
import { resolveStoreCompanyBrand } from "@/lib/store-company-brand";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id || session.error) {
    redirect("/login?error=SessionExpired");
  }

  const t = await getTranslations("Shop");
  const tBrand = await getTranslations("Brand");
  const userName = session.user.name || t("userFallback");
  const token = await getAccessToken();
  const brand = await resolveStoreCompanyBrand({
    accessToken: token,
    email: session.user.email,
    companyId: session.user.companyId,
    companyName: session.user.companyName,
    companyPhotoUrl: session.user.companyPhotoUrl,
  });
  let cartCount = 0;
  if (token) {
    try {
      const carts = await listStoreCarts(token);
      cartCount = cartItemCount(carts[0] ?? null);
    } catch (error) {
      handleUnauthorized(error);
    }
  }

  return (
    <Suspense fallback={<div className="min-h-full flex-1 bg-[var(--shop-surface)]" />}>
      <ShopShell
        userName={userName}
        photoUrl={session.user.photoUrl}
        companyName={brand?.name || tBrand("name")}
        companyPhotoUrl={brand?.photoUrl ?? null}
        cartCount={cartCount}
      >
        {children}
      </ShopShell>
    </Suspense>
  );
}
