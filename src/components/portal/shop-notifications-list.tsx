"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";

import {
  dismissShopNotificationAction,
  markAllShopNotificationsReadAction,
  markShopNotificationReadAction,
} from "@/app/(portal)/shop/notifications/actions";
import type { ApiInboxItem } from "@/lib/api/types";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "";
}

export function ShopNotificationsList({ items }: { items: ApiInboxItem[] }) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const unreadCount = items.filter((item) => !item.read_at).length;

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
            className="w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-semibold text-[var(--navy)] disabled:opacity-50 sm:w-auto"
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
          return (
            <li
              key={item.pk_multi_tenant_notification}
              className="rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
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
                  {item.notification.description ? (
                    <p className="mt-2 break-words whitespace-pre-wrap text-sm text-[var(--text)]">
                      {item.notification.description}
                    </p>
                  ) : null}
                  {item.notification.created_at ? (
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      {formatDate(item.notification.created_at)}
                    </p>
                  ) : null}
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:self-start">
                  {unread ? (
                    <button
                      type="button"
                      className="w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--navy)] disabled:opacity-50 sm:w-auto"
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
                    className="w-full rounded-[10px] border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50 sm:w-auto"
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
