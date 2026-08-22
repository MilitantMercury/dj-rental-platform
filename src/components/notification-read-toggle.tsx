type NotificationAction = (data: FormData) => void | Promise<void>;

export function NotificationReadToggle({
  notificationId,
  isRead,
  markReadAction,
  markUnreadAction,
}: {
  notificationId: string;
  isRead: boolean;
  markReadAction: NotificationAction;
  markUnreadAction: NotificationAction;
}) {
  return <form action={isRead ? markUnreadAction : markReadAction}>
    <input type="hidden" name="notificationId" value={notificationId} />
    <button type="submit">{isRead ? "Segna come non letta" : "Segna come letta"}</button>
  </form>;
}
