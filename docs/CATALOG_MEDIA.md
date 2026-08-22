# Media del catalogo

Il bucket pubblico `catalog` contiene esclusivamente immagini destinate al catalogo pubblico. La scrittura è riservata agli owner tramite RLS; anonimi e utenti autenticati possono leggere i file pubblicati.

## Formati e percorsi

- formati: JPEG, PNG, WebP e AVIF;
- dimensione massima: 5 MB;
- categorie: `categories/{category_id}/{image_id}.{ext}`;
- prodotti: `products/{product_id}/{image_id}.{ext}`;
- servizi: `services/{service_id}/{image_id}.{ext}`.

Categorie e servizi hanno una copertina. I prodotti mantengono una galleria in `product_images`; la prima immagine per ordinamento è usata come copertina.

Ogni upload viene validato lato server e associato all’entità solo dopo il caricamento. Se l’associazione fallisce, il file appena caricato viene rimosso. Il testo alternativo è limitato a 250 caratteri; quando è assente, l’interfaccia pubblica usa il nome dell’elemento.

Le immagini sono esposte all’applicazione tramite `/catalog-media/[...path]`, che accetta soltanto i percorsi catalogo previsti e inoltra al file pubblico Supabase.
