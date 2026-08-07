import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

/** Authenticated home shell — catalog/search/cart land here later. */
export default function PortalHomePage() {
  return null;
}
