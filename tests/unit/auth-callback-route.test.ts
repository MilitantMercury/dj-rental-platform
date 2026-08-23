import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const exchangeCodeForSession = vi.fn();
const verifyOtp = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession, verifyOtp },
  })),
}));

import { GET } from "@/app/auth/callback/route";

describe("callback autenticazione", () => {
  beforeEach(() => {
    exchangeCodeForSession.mockReset();
    verifyOtp.mockReset();
  });

  it("verifica il token hash di un invito e apre la scelta password", async () => {
    verifyOtp.mockResolvedValue({ error: null });

    const response = await GET(new NextRequest("http://localhost:3000/auth/callback?token_hash=hash&type=invite&next=/nuova-password"));

    expect(verifyOtp).toHaveBeenCalledWith({ token_hash: "hash", type: "invite" });
    expect(response.headers.get("location")).toBe("http://localhost:3000/nuova-password");
  });

  it("continua a supportare il callback PKCE", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(new NextRequest("http://localhost:3000/auth/callback?code=auth-code&next=/nuova-password"));

    expect(exchangeCodeForSession).toHaveBeenCalledWith("auth-code");
    expect(response.headers.get("location")).toBe("http://localhost:3000/nuova-password");
  });

  it("rifiuta destinazioni esterne e token non validi", async () => {
    verifyOtp.mockResolvedValue({ error: new Error("expired") });

    const response = await GET(new NextRequest("http://localhost:3000/auth/callback?token_hash=hash&type=invite&next=//example.com"));

    expect(response.headers.get("location")).toBe("http://localhost:3000/accesso?message=Link+non+valido+o+scaduto.");
  });
});
