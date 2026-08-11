import { getTranslations } from "next-intl/server";

import { ProductCard } from "@/components/shop/product-card";
import { Alert } from "@/components/ui/alert";
import { ApiError } from "@/lib/api/client";
import { fetchStoreCatalog } from "@/lib/api/catalog";
import { getAccessToken } from "@/lib/session";

const RECOMMENDED_COUNT = 3;

export async function ProductCatalog() {
  const t = await getTranslations("Shop");
  const token = await getAccessToken();

  if (!token) {
    return (
      <Alert tone="error">{t("catalogSessionError")}</Alert>
    );
  }

  let products: Awaited<ReturnType<typeof fetchStoreCatalog>>["data"] = [];
  let loadError: string | null = null;

  try {
    const response = await fetchStoreCatalog(token, {
      page: 1,
      limit: 50,
      orderBy: "name",
      sort: "asc",
    });
    products = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      loadError = t("catalogForbidden");
    } else {
      loadError = t("catalogLoadError");
    }
  }

  if (loadError) {
    return <Alert tone="error">{loadError}</Alert>;
  }

  const recommended = products.slice(0, RECOMMENDED_COUNT);

  return (
    <div className="space-y-8">
      {recommended.length > 0 ? (
        <section id="recommended" aria-labelledby="recommended-title">
          <h2
            id="recommended-title"
            className="mt-0 mb-4 font-[family-name:var(--font-display)] text-[1.35rem] font-bold text-[var(--navy)]"
          >
            {t("recommendedForYou")}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {recommended.map((product) => (
              <ProductCard key={`rec-${product.id}`} product={product} variant="recommended" />
            ))}
          </div>
        </section>
      ) : null}

      <section id="search" aria-labelledby="all-products-title">
        <h2
          id="all-products-title"
          className="mt-0 mb-4 font-[family-name:var(--font-display)] text-[1.35rem] font-bold text-[var(--navy)]"
        >
          {t("allProducts")}
        </h2>
        <div className="mb-5 rounded-[10px] border border-[#ddd] bg-[var(--shop-surface)] px-4 py-3 text-[0.9rem] text-[var(--text)]">
          {t("pricingNote")}
        </div>

        {products.length === 0 ? (
          <p className="m-0 text-[var(--text-muted)]">{t("catalogEmpty")}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} variant="catalog" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
