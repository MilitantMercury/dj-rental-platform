import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotificationReadToggle } from "@/components/notification-read-toggle";

describe("stato lettura notifica", () => {
  it("per una notifica letta propone di segnarla come non letta", () => {
    render(<NotificationReadToggle notificationId="notification-1" isRead markReadAction={vi.fn()} markUnreadAction={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Segna come non letta" })).toBeVisible();
    expect(screen.getByDisplayValue("notification-1")).toHaveAttribute("name", "notificationId");
  });

  it("per una notifica non letta mantiene l’azione di lettura", () => {
    render(<NotificationReadToggle notificationId="notification-2" isRead={false} markReadAction={vi.fn()} markUnreadAction={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Segna come letta" })).toBeVisible();
  });
});
