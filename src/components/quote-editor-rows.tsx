"use client";

import { useState } from "react";
import { euroToCents, formatEuroInput } from "@/lib/quote-pricing";

export type QuoteEditorRow = {
  id: string;
  sourceRequestItemId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
};

type EditableQuoteEditorRow = QuoteEditorRow & { unitPriceInput: string };

export function QuoteEditorRows({ initialRows, editable }: { initialRows: QuoteEditorRow[]; editable: boolean }) {
  const [rows, setRows] = useState<EditableQuoteEditorRow[]>(() =>
    initialRows.map((row) => ({ ...row, unitPriceInput: formatEuroInput(row.unitPriceCents) })),
  );

  const splitRow = (id: string) => {
    setRows((current) => current.flatMap((row) => {
      if (row.id !== id || row.quantity < 2) return [row];
      return [
        { ...row, quantity: 1 },
        { ...row, id: `${row.id}-split-${crypto.randomUUID()}`, quantity: row.quantity - 1 },
      ];
    }));
  };

  const updatePrice = (id: string, value: string) => {
    setRows((current) => current.map((row) => row.id === id
      ? { ...row, unitPriceInput: value, unitPriceCents: euroToCents(value) ?? 0 }
      : row));
  };

  const normalizePrice = (id: string) => {
    setRows((current) => current.map((row) => row.id === id
      ? { ...row, unitPriceInput: formatEuroInput(row.unitPriceCents) }
      : row));
  };

  return <div className="quote-editor-grid">
    <strong>Articolo richiesto</strong><strong>Quantità</strong><strong>Prezzo unitario (€)</strong><strong>Totale riga</strong>
    {rows.map((row) => <div className="quote-editor-row" key={row.id}>
      <input type="hidden" name="sourceItemId" value={row.sourceRequestItemId} />
      <input className="quote-description" value={row.description} readOnly aria-readonly="true" />
      <div className="quote-quantity"><input name="quantity" type="number" min="1" value={row.quantity} readOnly aria-readonly="true" /><button type="button" onClick={() => splitRow(row.id)} disabled={!editable || row.quantity < 2}>Dividi riga</button></div>
      <input name="unitPrice" inputMode="decimal" value={row.unitPriceInput} onFocus={(event) => event.currentTarget.select()} onChange={(event) => updatePrice(row.id, event.currentTarget.value)} onBlur={() => normalizePrice(row.id)} required disabled={!editable} />
      <output>{new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format((row.quantity * row.unitPriceCents) / 100)}</output>
    </div>)}
  </div>;
}
