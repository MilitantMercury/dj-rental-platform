# Media del catalogo

Il bucket pubblico `catalog` contiene esclusivamente immagini destinate al catalogo pubblico. La scrittura è riservata agli owner tramite RLS; anonimi e utenti autenticati possono leggere i file pubblicati.

## Formati e percorsi

- formati: JPEG, PNG, WebP e AVIF;
- dimensione massima: 5 MB;
- categorie: `categories/{category_id}/{image_id}.{ext}`;
- prodotti: `products/{product_id}/{image_id}.{ext}`;
- servizi: `services/{service_id}/{image_id}.{ext}`.

Categorie e servizi hanno una copertina sostituibile: dopo un aggiornamento riuscito il vecchio file viene rimosso. I prodotti mantengono una galleria in `product_images`; il gestore puo scegliere la copertina e rimuovere singole immagini.

Ogni upload viene validato lato server per MIME, dimensione e firma binaria e associato all’entità solo dopo il caricamento. Se l’associazione fallisce, il file appena caricato viene rimosso. Il testo alternativo è limitato a 250 caratteri; quando è assente, l’interfaccia pubblica usa il nome dell’elemento.

Le immagini sono esposte all’applicazione tramite `/catalog-media/[...path]`, che accetta soltanto i percorsi catalogo previsti e inoltra al file pubblico Supabase.

Caricamenti, sostituzioni, cambi copertina e rimozioni sono registrati in `audit_logs` tramite trigger database append-only. Il catalogo pubblico permette inoltre di filtrare prodotti e servizi per categoria tramite URL condivisibili.

## Ottimizzazione, ordine e pubblicazione

Gli upload vengono decodificati lato server, orientati secondo i metadati, ridimensionati senza ingrandimento a un massimo di 1920 px per lato e salvati in WebP qualità 82. Il file pubblico non conserva i metadati dell’originale e usa una cache immutabile annuale; il limite della Server Action è 6 MB, superiore al limite applicativo di 5 MB.

Categorie, prodotti e servizi nascono in bozza (`published_at` nullo). La pubblicazione valorizza `published_at` e rende l’elemento leggibile dalle policy pubbliche; la disattivazione resta una scelta separata e preserva lo storico. Owner e trigger database registrano pubblicazione, ritiro in bozza, stato e riordino in `audit_logs`.

L’ordine di categorie, prodotti, servizi e immagini prodotto viene modificato tramite una funzione database atomica, riservata all’owner. I pulsanti Su/Giù sono utilizzabili da tastiera; la prima e l’ultima posizione vengono disabilitate quando non applicabili.

## Editor e anteprima

L’owner può modificare nome, slug, categoria, descrizione, prezzo indicativo e i campi specifici di prodotti e servizi senza ricreare l’elemento. L’anteprima privata sotto `/area-riservata/catalogo/anteprima/...` verifica nuovamente ruolo e sessione lato server e permette di controllare anche le bozze senza renderle pubbliche.

La galleria prodotto supporta trascinamento per mouse e puntatore; al rilascio invia l’intera sequenza a `reorder_product_images`, che verifica appartenenza, duplicati e completezza prima di aggiornarla atomicamente. I pulsanti Su/Giù restano disponibili come fallback da tastiera.
