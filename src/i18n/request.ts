import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { resolveLocale } from "./config";

export default getRequestConfig(async () => {
  const headerStore = await headers();
  const locale = resolveLocale(headerStore.get("accept-language"));

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
