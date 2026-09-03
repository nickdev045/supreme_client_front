import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense, type ReactNode } from "react";

import { ShopShell } from "@/components/portal/shop-shell";
import { cartItemCount, listStoreCarts } from "@/lib/api/cart";
import { listPendingTerms } from "@/lib/api/terms";
import { handleUnauthorized } from "@/lib/handle-unauthorized";
import { getAccessToken, getSession } from "@/lib/session";
import { resolveStoreCompanyBrand } from "@/lib/store-company-brand";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id || session.error) {
    redirect("/login?error=SessionExpired");
  }

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const onAcceptPage = pathname.includes("/shop/terms/accept");

  const t = await getTranslations("Shop");
  const tBrand = await getTranslations("Brand");
  const userName = session.user.name || t("userFallback");
  const token = await getAccessToken();

  if (token && pathname && !onAcceptPage) {
    try {
      const pending = await listPendingTerms(token);
      if (pending.data.length > 0) {
        redirect("/shop/terms/accept");
      }
    } catch (error) {
      handleUnauthorized(error);
    }
  }

  const brand = await resolveStoreCompanyBrand({
    accessToken: token,
    email: session.user.email,
    companyId: session.user.companyId,
    companyName: session.user.companyName,
    companyPhotoUrl: session.user.companyPhotoUrl,
  });
  let cartCount = 0;
  if (token && !onAcceptPage) {
    try {
      const carts = await listStoreCarts(token);
      cartCount = cartItemCount(carts[0] ?? null);
    } catch (error) {
      handleUnauthorized(error);
    }
  }

  if (onAcceptPage) {
    return <div className="min-h-full flex-1 bg-[var(--shop-surface)]">{children}</div>;
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
