export function isPasswordResetNotification(
  title: string,
  description?: string | null,
): boolean {
  const haystack = `${title}\n${description ?? ""}`.toLowerCase();
  return (
    haystack.includes("password change authorized") ||
    haystack.includes("open link button") ||
    haystack.includes("one-time link")
  );
}

export function sanitizePasswordResetDescription(
  title: string,
  description?: string | null,
): string | null {
  if (!description) return description ?? null;
  if (!isPasswordResetNotification(title, description)) return description;
  return description
    .replace(/:\s*https?:\/\/\S+/gi, ".")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\?token=[^\s]+/gi, "")
    .replace(/\?ref=[^\s]+/gi, "")
    .trim();
}

export function shopPasswordResetHref(inboxId: number): string {
  return `/reset-password?inbox=${inboxId}`;
}
