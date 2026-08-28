"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";

import {
  dismissShopNotificationAction,
  markAllShopNotificationsReadAction,
  markShopNotificationReadAction,
} from "@/app/(portal)/shop/notifications/actions";
import { btn } from "@/components/ui/styles";
import type { ApiInboxItem } from "@/lib/api/types";
import {
  sanitizePasswordResetDescription,
  shopPasswordResetHref,
} from "@/lib/password-reset-notification";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "";
}

export function ShopNotificationsList({
  items,
  focusId,
}: {
  items: ApiInboxItem[];
  focusId?: number | null;
}) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unreadCount = items.filter((item) => !item.read_at).length;

  useEffect(() => {
    if (!focusId) return;
    document
      .querySelector(`[data-inbox-id="${focusId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId]);

  if (items.length === 0) {
    return (
      <p className="rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
        {t("notificationsEmpty")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 ? (
        <div className="flex justify-stretch sm:justify-end">
          <button
            type="button"
            className={`${btn.quiet} w-full sm:w-auto`}
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await markAllShopNotificationsReadAction();
                router.refresh();
              });
            }}
          >
            {t("markAllRead")}
          </button>
        </div>
      ) : null}
      <ul className="space-y-3">
        {items.map((item) => {
          const unread = !item.read_at;
          const canReset = Boolean(item.password_reset?.ref);
          const resetHref = shopPasswordResetHref(item.pk_multi_tenant_notification);
          const focused = focusId === item.pk_multi_tenant_notification;
          const description = sanitizePasswordResetDescription(
            item.notification.title,
            item.notification.description,
          );
          return (
            <li
              key={item.pk_multi_tenant_notification}
              data-inbox-id={item.pk_multi_tenant_notification}
              className={`rounded-[14px] border bg-[var(--shop-surface)] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${
                focused ? "border-[var(--navy)] ring-2 ring-[var(--navy)]" : "border-[#ddd]"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p
                      className={`min-w-0 break-words text-base ${
                        unread ? "font-semibold text-[var(--navy)]" : "font-medium text-[var(--text)]"
                      }`}
                    >
                      {item.notification.title}
                    </p>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-[0.55rem] py-[0.2rem] text-[0.72rem] font-semibold uppercase tracking-wide ${
                        unread
                          ? "bg-[rgba(232,93,4,0.12)] text-[var(--carrot)]"
                          : "bg-[rgba(61,122,74,0.15)] text-[var(--leaf)]"
                      }`}
                    >
                      {unread ? t("unread") : t("read")}
                    </span>
                  </div>
                  {description ? (
                    <p className="mt-2 break-words whitespace-pre-wrap text-sm text-[var(--text)]">
                      {description}
                    </p>
                  ) : null}
                  {item.notification.created_at ? (
                    <p
                      className="mt-2 text-xs text-[var(--text-muted)]"
                      suppressHydrationWarning
                    >
                      {formatDate(item.notification.created_at)}
                    </p>
                  ) : null}
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:self-start">
                  {canReset ? (
                    <Link href={resetHref} className={`${btn.primary} w-full sm:w-auto`}>
                      {t("openResetLink")}
                    </Link>
                  ) : null}
                  {unread ? (
                    <button
                      type="button"
                      className={`${btn.quiet} w-full sm:w-auto`}
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          await markShopNotificationReadAction(item.fk_notification);
                          router.refresh();
                        });
                      }}
                    >
                      {t("markRead")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={`${btn.dangerQuiet} w-full sm:w-auto`}
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        await dismissShopNotificationAction(item.fk_notification);
                        router.refresh();
                      });
                    }}
                  >
                    {t("dismiss")}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
