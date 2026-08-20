import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ShopResetPasswordForm } from "@/components/portal/reset-password-form";
import { fetchNotificationInboxDetail } from "@/lib/api/notifications";
import { getAccessToken } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations("Shop");
  return { title: t("resetPasswordTitle") };
}

export default async function ShopResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ inbox?: string; ref?: string; token?: string }>;
}) {
  const { inbox, ref, token } = await searchParams;
  const inboxId = Number.parseInt(inbox ?? "", 10);
  let resolvedRef = ref?.trim();
  const resetToken = token?.trim();

  if (!resolvedRef && !resetToken && Number.isFinite(inboxId) && inboxId > 0) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      redirect(`/login?callbackUrl=${encodeURIComponent(`/reset-password?inbox=${inboxId}`)}`);
    }
    const detail = await fetchNotificationInboxDetail(accessToken, inboxId).catch(() => null);
    resolvedRef = detail?.password_reset?.ref;
  }

  const t = await getTranslations("Shop");

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-[var(--navy)] px-4 py-12">
      <div className="w-full max-w-[420px] rounded-[14px] bg-white p-8 shadow-[0_4px_24px_rgba(26,43,76,0.18)]">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--navy)]">
          {t("resetPasswordTitle")}
        </h1>
        <p className="mt-1 mb-6 text-sm text-[var(--text-muted)]">{t("resetPasswordSubtitle")}</p>
        {resolvedRef || resetToken ? (
          <ShopResetPasswordForm refId={resolvedRef} token={resetToken} />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">{t("resetInvalidLink")}</p>
        )}
      </div>
    </main>
  );
}
