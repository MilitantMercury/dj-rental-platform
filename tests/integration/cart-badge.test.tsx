import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));

import { usePathname } from "next/navigation";
import { CartBadge } from "@/components/cart-badge";
import { createClient } from "@/lib/supabase/client";

const mockedPathname = vi.mocked(usePathname);
const mockedCreateClient = vi.mocked(createClient);

describe("contatore carrello", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggiorna il conteggio quando la navigazione porta alla conferma della richiesta", async () => {
    let pathname = "/richiesta";
    let quantities = [{ quantity: 3 }];

    mockedPathname.mockImplementation(() => pathname);
    mockedCreateClient.mockImplementation(() => ({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "customer-1" } } }) },
      from: vi.fn((table: string) => {
        if (table === "carts") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: { id: "cart-1" } }) })),
            })),
          };
        }

        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: quantities }),
          })),
        };
      }),
    }) as never);

    const view = render(<CartBadge />);

    await waitFor(() => expect(screen.getByText("3")).toBeVisible());

    quantities = [];
    pathname = "/richiesta/inviata";
    view.rerender(<CartBadge />);

    await waitFor(() => expect(screen.getByText("0")).toBeVisible());
  });
});
