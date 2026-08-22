import { describe, expect, it } from "vitest";
import { formatNotificationDate } from "@/lib/notifications";

describe("date notifiche", () => {
  const now = new Date("2026-08-22T12:00:00.000Z");

  it("formatta gli aggiornamenti recenti in modo relativo", () => {
    expect(formatNotificationDate("2026-08-22T11:58:00.000Z", now)).toBe("2 min fa");
    expect(formatNotificationDate("2026-08-22T10:00:00.000Z", now)).toBe("2 ore fa");
  });

  it("usa Europe/Rome per gli aggiornamenti meno recenti", () => {
    expect(formatNotificationDate("2026-08-20T10:00:00.000Z", now)).toContain("20 ago 2026");
  });
});
