import { appMessageTone, formatAppMessage, type AppMessageTone } from "@/lib/app-message";

export function AppMessage({ message, tone }: { message: string; tone?: AppMessageTone }) {
  const resolvedTone = tone ?? appMessageTone(message);
  const symbol = resolvedTone === "success" ? "✓" : resolvedTone === "error" ? "!" : "i";

  return (
    <div className={`app-message app-message--${resolvedTone}`} role={resolvedTone === "error" ? "alert" : "status"}>
      <span className="app-message-icon" aria-hidden="true">{symbol}</span>
      <span>{formatAppMessage(message)}</span>
    </div>
  );
}
