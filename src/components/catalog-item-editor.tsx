import Link from "next/link";
import { updateCatalogItem } from "@/app/area-riservata/catalogo/actions";

type CategoryOption = { id: string; name: string };
type EditorItem = {
  id: string; name: string; slug: string; description: string | null; category_id?: string | null; parent_id?: string | null;
  reference_price_cents?: number | null; included_accessories?: string; conditions?: string;
};

export function CatalogItemEditor({ table, item, categories }: { table: "categories" | "products" | "services"; item: EditorItem; categories: CategoryOption[] }) {
  return <details className="catalog-editor"><summary>Modifica e anteprima</summary><form action={updateCatalogItem} className="catalog-form">
    <input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={item.id} />
    <label>Nome<input name="name" defaultValue={item.name} required maxLength={160} /></label>
    <label>Slug<input name="slug" defaultValue={item.slug} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label>
    {table === "categories" ? <label>Categoria superiore<select name="parentId" defaultValue={item.parent_id ?? ""}><option value="">Nessuna</option>{categories.filter(category => category.id !== item.id).map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label> : <label>Categoria<select name="categoryId" defaultValue={item.category_id ?? ""}><option value="">Senza categoria</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>}
    <label>Descrizione<textarea name="description" defaultValue={item.description ?? ""} rows={4} /></label>
    {table !== "categories" && <label>Prezzo indicativo (centesimi)<input name="referencePriceCents" type="number" min="0" step="1" defaultValue={item.reference_price_cents ?? ""} /></label>}
    {table === "products" && <label>Accessori inclusi<textarea name="includedAccessories" defaultValue={item.included_accessories ?? ""} rows={3} /></label>}
    {table === "services" && <label>Condizioni<textarea name="conditions" defaultValue={item.conditions ?? ""} rows={3} /></label>}
    <div className="catalog-editor-actions"><button type="submit">Salva modifiche</button><Link href={`/area-riservata/catalogo/anteprima/${table}/${item.id}`}>Apri anteprima</Link></div>
  </form></details>;
}