import Link from "next/link";
import { updateCatalogItem } from "@/app/area-riservata/catalogo/actions";
import { CurrencyInput } from "@/components/currency-input";

type CategoryOption = { id: string; name: string };
type EditorItem = {
  id: string; name: string; slug: string; description: string | null; category_id?: string | null; parent_id?: string | null;
  reference_price_cents?: number | null; included_accessories?: string; conditions?: string;
};

export function CatalogItemEditor({ table, item, categories }: { table: "categories" | "products" | "services"; item: EditorItem; categories: CategoryOption[] }) {
  const typeLabel = table === "products" ? "Prodotto" : table === "services" ? "Servizio" : "Categoria";
  return <section className="catalog-editor-panel"><header><div><span className="catalog-editor-panel-index">{typeLabel}</span><div><strong>Dati e contenuti</strong><small>Aggiorna le informazioni mostrate nel catalogo.</small></div></div><Link href={`/area-riservata/catalogo/anteprima/${table}/${item.id}`}>Apri anteprima ↗</Link></header><details className="catalog-editor"><summary>Modifica scheda</summary><form action={updateCatalogItem} className="catalog-form">
    <input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={item.id} />
    <div className="catalog-editor-actions"><button type="submit">Salva modifiche</button><span>Le modifiche non vengono pubblicate automaticamente.</span></div>
    <label>Nome<input name="name" defaultValue={item.name} required maxLength={160} /></label>
    <label>Slug<input name="slug" defaultValue={item.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
    {table === "categories" ? <label>Categoria superiore<select name="parentId" defaultValue={item.parent_id ?? ""}><option value="">Nessuna</option>{categories.filter(category => category.id !== item.id).map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label> : <label>Categoria<select name="categoryId" defaultValue={item.category_id ?? ""}><option value="">Senza categoria</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}
    <label>Descrizione<textarea name="description" defaultValue={item.description ?? ""} rows={4} /></label>
    {table !== "categories" && <label>Prezzo indicativo (€)<CurrencyInput name="referencePrice" initialCents={item.reference_price_cents ?? null} placeholder="es. 150,00" /></label>}
    {table === "products" && <label>Accessori inclusi<textarea name="includedAccessories" defaultValue={item.included_accessories ?? ""} rows={3} /></label>}
    {table === "services" && <label>Condizioni<textarea name="conditions" defaultValue={item.conditions ?? ""} rows={3} /></label>}
  </form></details></section>;
}
