import { describe, expect, it } from "vitest";
import { appMessageTone, formatAppMessage } from "@/lib/app-message";

describe("messaggi applicativi", () => {
  it("traduce le chiavi tecniche in frasi leggibili", () => {
    expect(formatAppMessage("pratica-chiusa")).toBe("Pratica chiusa correttamente.");
    expect(formatAppMessage("collaboratore-assegnato")).toBe("Collaboratore assegnato.");
  });

  it("distingue gli errori dagli esiti positivi", () => {
    expect(appMessageTone("Immagine ottimizzata e caricata.")).toBe("success");
    expect(appMessageTone("pubblicazione-non-riuscita")).toBe("error");
  });
});
