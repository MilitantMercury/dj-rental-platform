"use client";

import { useEffect, useState } from "react";
import { FORM_SCROLL_STORAGE_KEY } from "@/components/form-feedback-bridge";
import { appMessageTone, formatAppMessage, type AppMessageTone } from "@/lib/app-message";

export function AppMessage({ message, tone }: { message: string; tone?: AppMessageTone }) {
  const resolvedTone = tone ?? appMessageTone(message);
  const symbol = resolvedTone === "success" ? "✓" : resolvedTone === "error" ? "!" : "i";
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const savedScroll = window.sessionStorage.getItem(FORM_SCROLL_STORAGE_KEY);
    window.sessionStorage.removeItem(FORM_SCROLL_STORAGE_KEY);
    if (savedScroll) {
      try {
        const saved = JSON.parse(savedScroll) as { pathname?: string; scrollY?: number; savedAt?: number };
        if (saved.pathname === window.location.pathname && typeof saved.scrollY === "number" && typeof saved.savedAt === "number" && Date.now() - saved.savedAt < 30_000) {
          window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.scrollTo({ top: saved.scrollY, behavior: "instant" })));
        }
      } catch {
        // Ignore stale or malformed session data.
      }
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has("message")) {
      url.searchParams.delete("message");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
    if (resolvedTone === "success") {
      const timeout = window.setTimeout(() => setVisible(false), 4500);
      return () => window.clearTimeout(timeout);
    }
  }, [resolvedTone]);

  if (!visible) return null;

  return (
    <div className={`app-message app-message--${resolvedTone} app-message-toast`} role={resolvedTone === "error" ? "alert" : "status"}>
      <span className="app-message-icon" aria-hidden="true">{symbol}</span>
      <span>{formatAppMessage(message)}</span>
      <button className="app-message-close" type="button" aria-label="Chiudi notifica" onClick={() => setVisible(false)}>×</button>
    </div>
  );
}
