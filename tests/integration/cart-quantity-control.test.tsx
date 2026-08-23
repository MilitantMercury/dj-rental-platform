import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartQuantityControl } from "@/components/add-to-cart";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));

describe("selettore quantità catalogo", () => {
  it("mostra la quantità corrente e permette di aumentarla o ridurla", () => {
    const decrease = vi.fn();
    const increase = vi.fn();
    render(<CartQuantityControl name="Console DJ" quantity={2} busy={false} error={false} onDecrease={decrease} onIncrease={increase} />);
    expect(screen.getByLabelText("Quantità 2")).toHaveTextContent("2");
    fireEvent.click(screen.getByRole("button", { name: "Riduci quantità di Console DJ" }));
    fireEvent.click(screen.getByRole("button", { name: "Aumenta quantità di Console DJ" }));
    expect(decrease).toHaveBeenCalledOnce();
    expect(increase).toHaveBeenCalledOnce();
  });
});
