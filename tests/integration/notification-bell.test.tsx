import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotificationBell } from "@/components/notification-bell";

describe("campanella notifiche", () => {
  it("mostra il numero di notifiche non lette con un link accessibile", () => {
    render(<NotificationBell unreadCount={3} />);
    expect(screen.getByRole("link", { name: "Notifiche, 3 non lette" })).toHaveAttribute("href", "/area-riservata/notifiche");
    expect(screen.getByText("3")).toBeVisible();
  });

  it("non mostra il badge quando non ci sono notifiche non lette", () => {
    render(<NotificationBell unreadCount={0} />);
    expect(screen.getByRole("link", { name: "Notifiche" })).toBeVisible();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
