import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { ClearShopFiltersOnReload } from "@/components/shop/clear-shop-filters-on-reload";
import { ProductCatalog } from "@/components/shop/product-catalog";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

type ShopHomePageProps = {
  searchParams: Promise<{
    q?: string;
    orderBy?: string;
    sort?: string;
  }>;
};

export default async function ShopHomePage({ searchParams }: ShopHomePageProps) {
  const params = await searchParams;
  return (
    <>
      <Suspense fallback={null}>
        <ClearShopFiltersOnReload />
      </Suspense>
      <ProductCatalog
        search={params.q}
        orderBy={params.orderBy}
        sort={params.sort}
      />
    </>
  );
}
