type SearchableCatalogItem = { name: string; description?: string | null; included_accessories?: string | null; conditions?: string | null };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("it-IT");
export function matchesCatalogSearch(item: SearchableCatalogItem, query: string) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize([item.name, item.description, item.included_accessories, item.conditions].filter(Boolean).join(" "));
  return words.every(word => haystack.includes(word));
}
