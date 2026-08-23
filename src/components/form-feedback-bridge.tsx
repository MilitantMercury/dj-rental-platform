"use client";

import { useEffect } from "react";

export const FORM_SCROLL_STORAGE_KEY = "app:form-scroll";

export function FormFeedbackBridge() {
  useEffect(() => {
    const rememberScroll = (event: Event) => {
      if (!(event.target instanceof HTMLFormElement)) return;
      window.sessionStorage.setItem(FORM_SCROLL_STORAGE_KEY, JSON.stringify({
        pathname: window.location.pathname,
        scrollY: window.scrollY,
        savedAt: Date.now(),
      }));
    };
    document.addEventListener("submit", rememberScroll, true);
    return () => document.removeEventListener("submit", rememberScroll, true);
  }, []);

  return null;
}
