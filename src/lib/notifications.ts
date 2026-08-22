export type NotificationKind =
  | "request_created"
  | "request_status_changed"
  | "quote_published"
  | "quote_responded"
  | "request_assigned";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  read_at: string | null;
  created_at: string;
};

export function formatNotificationDate(value: string, now = new Date()) {
  const date = new Date(value);
  const diffMinutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
  if (diffMinutes < 1) return "Adesso";
  if (diffMinutes < 60) return `${diffMinutes} min fa`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "ora" : "ore"} fa`;
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Rome" }).format(date);
}
