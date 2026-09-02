export const DEFAULT_COMPANY_LOGO = "/logo.png";

export function companyLogoSrc(photoUrl: string | null | undefined): string {
  const value = photoUrl?.trim();
  return value ? value : DEFAULT_COMPANY_LOGO;
}

export function isRemoteImageSrc(src: string): boolean {
  return /^https?:\/\//i.test(src);
}
