import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ShopNotificationsList } from "@/components/portal/shop-notifications-list";
import { fetchNotificationInbox } from "@/lib/api/notifications";
import { handleUnauthorized } from "@/lib/handle-unauthorized";
import { getAccessToken } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("notificationsTitle"),
    description: t("notificationsDescription"),
  };
}

export default async function ShopNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect("/login");
  let inbox;
  try {
    inbox = await fetchNotificationInbox(token);
  } catch (error) {
    handleUnauthorized(error);
  }
  const t = await getTranslations("Shop");
  const { focus } = await searchParams;
  const focusId = Number.parseInt(focus ?? "", 10);

  return (
    <section className="space-y-4">
      <div className="min-w-0">
        <h1 className="break-words text-xl font-bold text-[var(--navy)] sm:text-2xl">
          {t("notifications")}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t("notificationsSubtitle")}</p>
      </div>
      <ShopNotificationsList
        items={inbox}
        focusId={Number.isFinite(focusId) && focusId > 0 ? focusId : null}
      />
    </section>
  );
}
