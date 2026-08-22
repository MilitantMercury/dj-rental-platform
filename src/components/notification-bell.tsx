import Link from "next/link";

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  const label = unreadCount === 0 ? "Notifiche" : `Notifiche, ${unreadCount} non lette`;
  return (
    <Link className="notification-bell" href="/area-riservata/notifiche" aria-label={label}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
      {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
    </Link>
  );
}
