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
    expect(appMessageTone("L’immagine è troppo piccola. Usa un file di almeno 800 px sul lato corto e 1200 px sul lato lungo.")).toBe("error");
    expect(appMessageTone("La galleria può contenere al massimo 5 immagini.")).toBe("error");
  });
});
