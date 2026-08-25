"use client";

import { useEffect, useRef } from "react";

export function JourneyProgress() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const journey = track?.closest<HTMLElement>(".wow-journey");
    if (!track || !journey) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = journey.getBoundingClientRect();
      const startLine = window.innerHeight * 0.82;
      const endLine = window.innerHeight * 0.28;
      const distance = Math.max(rect.height + startLine - endLine, 1);
      const progress = Math.min(1, Math.max(0, (startLine - rect.top) / distance));
      track.style.setProperty("--journey-progress", progress.toFixed(4));
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={trackRef} className="wow-journey-track" aria-hidden="true"><i /></div>;
}
