import { catalogMediaUrl } from "@/lib/catalog-media-url";

export type CartViewItem = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  rowId: string;
  imageUrl: string | null;
  imageAlt: string;
};

type CartRow = { id: string; item_type: string; quantity: number; product_id: string | null; service_id: string | null };
type CatalogName = { id: string; name: string };
type ProductImage = { product_id: string; storage_path: string; alt_text: string | null };

export function buildCartViewItems(rows: CartRow[], products: CatalogName[], services: CatalogName[], productImages: ProductImage[]): CartViewItem[] {
  const names = new Map([...products, ...services].map(item => [item.id, item.name]));
  const primaryImages = new Map<string, ProductImage>();
  for (const image of productImages) {
    if (!primaryImages.has(image.product_id)) primaryImages.set(image.product_id, image);
  }

  return rows.map(item => {
    const id = item.product_id ?? item.service_id ?? "";
    const name = names.get(id) ?? "Elemento catalogo";
    const image = item.product_id ? primaryImages.get(item.product_id) : null;
    return {
      rowId: item.id,
      id,
      name,
      type: item.item_type,
      quantity: item.quantity,
      imageUrl: image ? catalogMediaUrl(image.storage_path) : null,
      imageAlt: image?.alt_text || name,
    };
  });
}
