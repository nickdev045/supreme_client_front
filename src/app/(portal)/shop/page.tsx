import { getTranslations } from "next-intl/server";

import { ProductCatalog } from "@/components/shop/product-catalog";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

export default async function ShopHomePage() {
  return <ProductCatalog />;
}
