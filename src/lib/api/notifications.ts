import { apiData } from "@/lib/api/client";
import type { ApiInboxItem } from "@/lib/api/types";

export function fetchNotificationInbox(token: string) {
  return apiData<ApiInboxItem[]>("/api/v1/engagement/notifications/inbox", {
    method: "GET",
    token,
  });
}

export function fetchNotificationInboxDetail(token: string, inboxId: number) {
  return apiData<ApiInboxItem>(`/api/v1/engagement/notifications/inbox/${inboxId}`, {
    method: "GET",
    token,
  });
}

export function fetchNotificationUnreadCount(token: string) {
  return apiData<{ unread: number }>("/api/v1/engagement/notifications/inbox/unread-count", {
    method: "GET",
    token,
  });
}

export function markNotificationRead(token: string, id: number) {
  return apiData<{ read: true }>(`/api/v1/engagement/notifications/${id}/read`, {
    method: "PATCH",
    token,
  });
}

export function markAllNotificationsRead(token: string) {
  return apiData<{ read: true; updated: number }>(
    "/api/v1/engagement/notifications/inbox/read-all",
    { method: "PATCH", token },
  );
}

export function dismissNotification(token: string, id: number) {
  return apiData<{ dismissed: true }>(`/api/v1/engagement/notifications/${id}/dismiss`, {
    method: "PATCH",
    token,
  });
}