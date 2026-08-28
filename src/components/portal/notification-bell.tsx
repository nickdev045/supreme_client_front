"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import {
  dismissShopNotificationAction,
  loadShopInboxAction,
  markAllShopNotificationsReadAction,
  markShopNotificationReadAction,
} from "@/app/(portal)/shop/notifications/actions";
import type { ApiInboxItem } from "@/lib/api/types";
import { shopPasswordResetHref } from "@/lib/password-reset-notification";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function ShopNotificationBell({ variant = "header" }: { variant?: "header" | "mobile" }) {
  const t = useTranslations("Shop");
  const pathname = usePathname();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<ApiInboxItem[]>([]);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const result = await loadShopInboxAction();
      if (!result.ok) return;
      setUnread(result.unread);
      setItems(result.inbox.slice(0, 6));
    });
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const badge = unread > 0 ? (unread > 99 ? "99+" : String(unread)) : null;

  if (variant === "mobile") {
    const active = pathname.startsWith("/shop/notifications");
    return (
      <Link
        href="/shop/notifications"
        className={[
          "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-[0.15rem] px-0.5 py-[0.35rem] text-[0.6rem] font-semibold",
          active ? "text-[var(--navy)]" : "text-[var(--text-muted)]",
        ].join(" ")}
      >
        <span
          className={[
            "relative flex h-7 w-7 items-center justify-center rounded-lg",
            active ? "bg-[rgba(26,43,76,0.1)]" : "",
          ].join(" ")}
        >
          <BellIcon className="h-[20px] w-[20px]" />
          {badge ? (
            <span className="absolute -top-1 -right-1 inline-flex min-w-[1rem] items-center justify-center rounded-full bg-[var(--carrot)] px-1 text-[0.6rem] font-bold text-white">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="truncate">{t("alerts")}</span>
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
          <button
            type="button"
            className="relative flex flex-col items-center justify-center gap-[0.1rem] rounded px-[0.6rem] py-[0.35rem] text-[var(--cream)] transition-colors duration-200 hover:bg-white/15"
            aria-label={t("notifications")}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((value) => !value);
          refresh();
        }}
      >
        <span className="relative inline-flex">
          <BellIcon className="h-[22px] w-[22px]" />
          {badge ? (
            <span className="absolute -top-1.5 -right-2 inline-flex min-w-[1.15rem] items-center justify-center rounded-full bg-[var(--carrot)] px-1 text-[0.65rem] font-bold text-white">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="text-[0.78rem] font-bold">{t("notifications")}</span>
      </button>
      {open ? (
        <div
          id={menuId}
          className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] text-[var(--text)] shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
            <p className="min-w-0 truncate text-sm font-semibold">{t("notifications")}</p>
            {unread > 0 ? (
              <button
                type="button"
                className="rounded px-1.5 py-1 text-xs font-semibold text-[var(--navy)] transition-colors duration-200 hover:bg-[var(--cream)] disabled:opacity-50"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    await markAllShopNotificationsReadAction();
                    refresh();
                  });
                }}
              >
                {t("markAllRead")}
              </button>
            ) : null}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm opacity-70">{t("notificationsEmpty")}</li>
            ) : (
              items.map((item) => (
                <li key={item.pk_multi_tenant_notification} className="border-b border-[var(--border)] last:border-0">
                  <div className="flex items-start gap-1">
                    <Link
                      href={`/shop/notifications?focus=${item.pk_multi_tenant_notification}`}
                      className="group min-w-0 flex-1 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-[var(--navy)]"
                      onClick={() => {
                        setOpen(false);
                        void markShopNotificationReadAction(item.fk_notification);
                      }}
                    >
                      <p className={`break-words text-sm group-hover:text-[var(--cream)] ${item.read_at ? "font-medium" : "font-semibold text-[var(--navy)]"}`}>
                        {item.notification.title}
                      </p>
                      {item.notification.description ? (
                        <p className="mt-0.5 line-clamp-2 break-words text-xs opacity-70 group-hover:text-[var(--cream)] group-hover:opacity-90">
                          {item.notification.description}
                        </p>
                      ) : null}
                    </Link>
                    {item.password_reset?.ref ? (
                      <Link
                        href={shopPasswordResetHref(item.pk_multi_tenant_notification)}
                        className="mt-1.5 shrink-0 rounded-[8px] px-2 py-1 text-xs font-semibold text-[var(--navy)] underline"
                        onClick={() => setOpen(false)}
                      >
                        {t("openResetLink")}
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="mt-1.5 mr-2 shrink-0 rounded-[8px] px-2 py-1 text-xs font-semibold text-[var(--navy)] opacity-80 transition-colors duration-200 hover:bg-[var(--cream)] hover:opacity-100 disabled:opacity-50"
                      disabled={pending}
                      aria-label={t("dismiss")}
                      title={t("dismiss")}
                      onClick={() => {
                        startTransition(async () => {
                          await dismissShopNotificationAction(item.fk_notification);
                          refresh();
                        });
                      }}
                    >
                      {t("dismiss")}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
          <div className="border-t border-[var(--border)] px-3 py-2">
            <Link
              href="/shop/notifications"
              className="inline-flex rounded px-1 py-1 text-xs font-semibold text-[var(--navy)] transition-colors duration-200 hover:bg-[var(--cream)]"
              onClick={() => setOpen(false)}
            >
              {t("viewAllNotifications")}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}