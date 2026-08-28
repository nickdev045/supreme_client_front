export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

function localeFromTag(tag: string): Locale | null {
  const normalized = tag.trim().toLowerCase();
  if (!normalized || normalized === "*") return null;
  if (isLocale(normalized)) return normalized;

  const language = normalized.split("-")[0];
  return isLocale(language) ? language : null;
}

/** Picks a supported locale from Accept-Language; English is the fallback. */
export function resolveLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage?.trim()) return defaultLocale;

  const candidates = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [rawTag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().toLowerCase().startsWith("q="));
      const quality = qParam ? Number(qParam.trim().slice(2)) : 1;
      return {
        tag: rawTag.trim(),
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((candidate) => candidate.tag.length > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const candidate of candidates) {
    if (candidate.quality <= 0) continue;
    const locale = localeFromTag(candidate.tag);
    if (locale) return locale;
  }

  return defaultLocale;
}
