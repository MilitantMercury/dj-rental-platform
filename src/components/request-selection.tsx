import Link from "next/link";

export type RequestSelectionItem = { id: string; name: string; type: "product" | "service"; quantity: number };

export function RequestSelection({ items }: { items: RequestSelectionItem[] }) {
  return <section className="request-section request-selection" aria-labelledby="request-selection-title">
    <div className="request-selection-heading"><div><p className="request-section-title">La tua selezione</p><h2 id="request-selection-title">Cosa includere nella proposta</h2></div><Link href="/carrello">Modifica carrello</Link></div>
    <ul>{items.map((item) => <li key={`${item.type}-${item.id}`}><span><small>{item.type === "product" ? "Attrezzatura" : "Servizio"}</small><strong>{item.name}</strong></span><b aria-label={`Quantità ${item.quantity}`}>× {item.quantity}</b></li>)}</ul>
    <p>Questa selezione verrà salvata come fotografia storica della richiesta. Non blocca la disponibilità e non costituisce una prenotazione.</p>
  </section>;
}
