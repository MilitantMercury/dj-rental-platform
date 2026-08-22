import Link from "next/link";
import { redirect } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { createClient } from "@/lib/supabase/server";
import { formatNotificationDate, type AppNotification } from "@/lib/notifications";
import { markAllNotificationsRead, markNotificationRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/accesso");
  const { data } = await supabase.from("notifications").select("id,kind,title,body,href,read_at,created_at").order("created_at", { ascending: false }).limit(100);
  const notifications = (data ?? []) as AppNotification[];
  const hasUnread = notifications.some((notification) => !notification.read_at);

  return <main className="dashboard shell notifications-page">
    <BackLink href="/area-riservata">Area riservata</BackLink>
    <header className="notifications-header">
      <div><p className="eyebrow dark">Aggiornamenti</p><h1>Notifiche</h1><p>Le attività importanti del tuo account, raccolte in un unico posto.</p></div>
      {hasUnread && <form action={markAllNotificationsRead}><button type="submit" className="notifications-read-all">Segna tutte come lette</button></form>}
    </header>
    {notifications.length === 0 ? <section className="notifications-empty"><h2>Nessuna notifica</h2><p>Quando ci saranno novità sulle tue attività, le troverai qui.</p></section> :
      <ol className="notifications-list">{notifications.map((notification) => <li key={notification.id} className={notification.read_at ? "is-read" : "is-unread"}>
        <span className="notification-dot" aria-label={notification.read_at ? "Letta" : "Non letta"} />
        <div><p className="notification-meta">{formatNotificationDate(notification.created_at)}</p><h2>{notification.title}</h2><p>{notification.body}</p></div>
        <div className="notification-actions">
          <Link href={notification.href}>Apri</Link>
          {!notification.read_at && <form action={markNotificationRead}><input type="hidden" name="notificationId" value={notification.id} /><button type="submit">Segna come letta</button></form>}
        </div>
      </li>)}</ol>}
  </main>;
}
