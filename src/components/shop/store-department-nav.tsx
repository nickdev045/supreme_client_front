import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { CatalogInitialMark } from "@/components/shop/catalog-initial";
import type { StoreCatalogDepartment } from "@/lib/api/types";
import { buildShopHref, type ShopCatalogQuery } from "@/lib/shop-query";

type StoreDepartmentNavProps = {
  departments: StoreCatalogDepartment[];
  filters: ShopCatalogQuery;
};

function categoryLinkClass() {
  return [
    "group flex min-h-11 flex-col items-center gap-1.5 rounded-[14px] px-1 py-1 text-inherit no-underline",
    "transition-[color,background-color,box-shadow,transform] duration-200",
    "hover:-translate-y-px",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)]",
  ].join(" ");
}

function categoryCircleClass(active: boolean) {
  return [
    "flex h-14 w-14 items-center justify-center rounded-full border-2 sm:h-16 sm:w-16",
    "transition-[border-color,box-shadow] duration-200",
    "group-hover:border-[var(--navy-hover)] group-hover:shadow-[var(--shadow)]",
    active ? "border-[var(--navy)]" : "border-transparent",
  ].join(" ");
}

function subcategoryChipClass(active: boolean) {
  return [
    "inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-1.5 text-sm no-underline",
    "transition-[color,background-color,border-color,box-shadow,transform] duration-200",
    "hover:-translate-y-px hover:border-[var(--navy-hover)] hover:shadow-[var(--shadow)]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)]",
    active
      ? "border-[var(--navy)] bg-[rgba(26,43,76,0.08)] font-semibold text-[var(--navy)]"
      : "border-[var(--border)] bg-[var(--shop-surface)] text-[var(--text)] hover:text-[var(--navy)]",
  ].join(" ");
}

function categoryLabelClass(active: boolean) {
  return [
    "line-clamp-2 text-center text-[0.7rem] leading-tight transition-colors duration-200 sm:text-xs",
    "group-hover:font-semibold group-hover:text-[var(--navy)]",
    active ? "font-semibold text-[var(--navy)]" : "text-[var(--text)]",
  ].join(" ");
}

function DepartmentImage({
  name,
  image,
  sizeClass,
}: {
  name: string;
  image: string | null;
  sizeClass: string;
}) {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--shop-surface-muted)]",
        sizeClass,
      ].join(" ")}
    >
      {image ? (
        // Category images come from the same upload hosts as product photos.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <CatalogInitialMark name={name} className="h-full w-full text-sm sm:text-base" />
      )}
    </span>
  );
}

export async function StoreDepartmentNav({
  departments,
  filters,
}: StoreDepartmentNavProps) {
  const t = await getTranslations("Shop");
  const selectedCategory = filters.fk_product_category;
  const selectedSubcategory = filters.fk_product_subcategory;
  const selectedDepartment = departments.find((item) => item.id === selectedCategory);
  const shared = {
    search: filters.search,
    orderBy: filters.orderBy,
    sort: filters.sort,
  };

  if (departments.length === 0) return null;

  return (
    <div className="space-y-3">
      <nav aria-label={t("categories")} className="-mx-1 overflow-x-auto pb-1">
        <ul className="m-0 flex list-none items-start gap-3 px-1 py-1">
          <li className="w-[4.5rem] shrink-0 sm:w-[5.25rem]">
            <Link
              href={buildShopHref(shared)}
              className={categoryLinkClass()}
              aria-current={!selectedCategory ? "page" : undefined}
            >
              <span className={categoryCircleClass(!selectedCategory)}>
                <DepartmentImage name={t("allProducts")} image={null} sizeClass="h-full w-full" />
              </span>
              <span className={categoryLabelClass(!selectedCategory)}>
                {t("allProducts")}
              </span>
            </Link>
          </li>
          {departments.map((department) => {
            const active = department.id === selectedCategory;
            return (
              <li key={department.id} className="w-[4.5rem] shrink-0 sm:w-[5.25rem]">
                <Link
                  href={buildShopHref({ ...shared, fk_product_category: department.id })}
                  className={categoryLinkClass()}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={categoryCircleClass(active)}>
                    <DepartmentImage
                      name={department.name}
                      image={department.image}
                      sizeClass="h-full w-full"
                    />
                  </span>
                  <span className={categoryLabelClass(active)}>
                    {department.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {selectedDepartment && selectedDepartment.subcategories.length > 0 ? (
        <nav aria-label={t("subcategories")} className="-mx-1 overflow-x-auto pb-1">
          <ul className="m-0 flex list-none items-center gap-2 px-1 py-1">
            <li>
              <Link
                href={buildShopHref({
                  ...shared,
                  fk_product_category: selectedDepartment.id,
                })}
                className={subcategoryChipClass(!selectedSubcategory)}
                aria-current={!selectedSubcategory ? "page" : undefined}
              >
                <DepartmentImage
                  name={t("allSubcategories")}
                  image={null}
                  sizeClass="h-7 w-7"
                />
                {t("allSubcategories")}
              </Link>
            </li>
            {selectedDepartment.subcategories.map((subcategory) => {
              const active = subcategory.id === selectedSubcategory;
              return (
                <li key={subcategory.id}>
                  <Link
                    href={buildShopHref({
                      ...shared,
                      fk_product_category: selectedDepartment.id,
                      fk_product_subcategory: subcategory.id,
                    })}
                    className={subcategoryChipClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    <DepartmentImage
                      name={subcategory.name}
                      image={subcategory.image}
                      sizeClass="h-7 w-7"
                    />
                    {subcategory.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
