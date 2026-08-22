import { describe, expect, it } from "vitest";
import {
  formatEventDate,
  formatEventDateTime,
  formatRomeDateTime,
  formatRomeLongDate,
} from "@/lib/date-time";

describe("formattazione date Europe/Rome", () => {
  it("mantiene invariata una data civile dell'evento", () => {
    expect(formatEventDate("2026-03-29")).toBe("29 mar 2026");
    expect(formatEventDate("valore-non-valido")).toBe("valore-non-valido");
  });

  it("applica CET durante l'ora solare", () => {
    expect(formatRomeDateTime("2026-01-15T17:45:00.000Z")).toBe(
      "15 gen 2026, 18:45",
    );
  });

  it("applica CEST durante l'ora legale", () => {
    expect(formatRomeDateTime("2026-08-17T16:45:00.000Z")).toBe(
      "17 ago 2026, 18:45",
    );
    expect(formatRomeLongDate("2026-08-17T22:30:00.000Z")).toBe(
      "18 agosto 2026",
    );
  });

  it("formatta data e ora dell'evento nella zona Europe/Rome", () => {
    expect(formatEventDateTime("2026-08-17T16:45:00.000Z")).toBe(
      "17 ago 2026, 18:45",
    );
  });

  it("salta automaticamente l'ora inesistente al passaggio primaverile", () => {
    expect(formatRomeDateTime("2026-03-29T00:30:00.000Z")).toBe(
      "29 mar 2026, 01:30",
    );
    expect(formatRomeDateTime("2026-03-29T01:30:00.000Z")).toBe(
      "29 mar 2026, 03:30",
    );
  });

  it("rappresenta correttamente l'ora duplicata al passaggio autunnale", () => {
    expect(formatRomeDateTime("2026-10-25T00:30:00.000Z")).toBe(
      "25 ott 2026, 02:30",
    );
    expect(formatRomeDateTime("2026-10-25T01:30:00.000Z")).toBe(
      "25 ott 2026, 02:30",
    );
  });
});
