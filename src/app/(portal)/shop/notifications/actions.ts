"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api/client";
import {
  dismissNotification,
  fetchNotificationInbox,
  fetchNotificationUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import type { ApiInboxItem } from "@/lib/api/types";
import { getAccessToken } from "@/lib/session";

function revalidateInbox() {
  revalidatePath("/shop");
  revalidatePath("/shop/notifications");
}

export async function loadShopInboxAction(): Promise<
  { ok: true; inbox: ApiInboxItem[]; unread: number } | { ok: false; inbox: []; unread: 0 }
> {
  const token = await getAccessToken();
  if (!token) return { ok: false, inbox: [], unread: 0 };
  try {
    const [inbox, count] = await Promise.all([
      fetchNotificationInbox(token),
      fetchNotificationUnreadCount(token),
    ]);
    return { ok: true, inbox, unread: count.unread };
  } catch {
    return { ok: false, inbox: [], unread: 0 };
  }
}

export async function loadShopUnreadCountAction() {
  const token = await getAccessToken();
  if (!token) return { ok: false as const, unread: 0 };
  try {
    const count = await fetchNotificationUnreadCount(token);
    return { ok: true as const, unread: count.unread };
  } catch {
    return { ok: false as const, unread: 0 };
  }
}

export async function markShopNotificationReadAction(id: number) {
  const token = await getAccessToken();
  if (!token) return { ok: false as const };
  try {
    await markNotificationRead(token, id);
    revalidateInbox();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { ok: false as const };
    return { ok: false as const };
  }
}

export async function dismissShopNotificationAction(id: number) {
  const token = await getAccessToken();
  if (!token) return { ok: false as const };
  try {
    await dismissNotification(token, id);
    revalidateInbox();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { ok: false as const };
    return { ok: false as const };
  }
}

export async function markAllShopNotificationsReadAction() {
  const token = await getAccessToken();
  if (!token) return { ok: false as const };
  try {
    await markAllNotificationsRead(token);
    revalidateInbox();
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
}