"use client";

import { useId, useState } from "react";

export function slugFromName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function CatalogSlugFields() {
  const helpId = useId();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [customSlug, setCustomSlug] = useState(false);

  return <>
    <label>Nome<input name="name" value={name} onChange={event => {
      const nextName = event.target.value;
      setName(nextName);
      if (!customSlug) setSlug(slugFromName(nextName));
    }} required /></label>
    <label>Indirizzo pagina (slug)<input name="slug" value={slug} onChange={event => {
      setCustomSlug(true);
      setSlug(slugFromName(event.target.value));
    }} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="es. console-dj-pioneer" aria-describedby={helpId} required /><small id={helpId} className="catalog-slug-help">Generato dal nome. Puoi modificarlo usando lettere minuscole, numeri e trattini.</small></label>
  </>;
}
