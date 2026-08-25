import { moveCatalogItem, toggleCatalogHomeFeature, toggleCatalogItem, toggleCatalogPublication } from "@/app/area-riservata/catalogo/actions";

type CatalogTable = "categories" | "products" | "services";

export function CatalogItemControls({ table, id, active, published, first, last, featured = false, hasMedia = true }: { table: CatalogTable; id: string; active: boolean; published: boolean; first: boolean; last: boolean; featured?: boolean; hasMedia?: boolean }) {
  return <div className="catalog-item-controls">
    <span className={`catalog-state ${published ? "is-published" : "is-draft"}`}>{published ? "Pubblicato" : "Bozza"}</span>
    <form action={moveCatalogItem} aria-label="Modifica ordine"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} /><button type="submit" name="direction" value="-1" disabled={first} aria-label="Sposta prima">↑</button><button type="submit" name="direction" value="1" disabled={last} aria-label="Sposta dopo">↓</button></form>
    <form action={toggleCatalogPublication}><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} /><input type="hidden" name="published" value={String(published)} /><button type="submit">{published ? "Riporta in bozza" : "Pubblica"}</button></form>
    <form action={toggleCatalogItem}><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} /><input type="hidden" name="active" value={String(active)} /><button className="status-button" type="submit">{active ? "Disattiva" : "Riattiva"}</button></form>
    {table !== "categories" && <form className={`catalog-feature-control${featured ? " is-featured" : ""}`} action={toggleCatalogHomeFeature}><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} /><input type="hidden" name="featured" value={String(featured)} /><button type="submit" aria-pressed={featured} disabled={!featured && (!active || !published || !hasMedia)}>{featured ? "★ In copertina" : "☆ Metti in copertina"}</button></form>}
  </div>;
}
