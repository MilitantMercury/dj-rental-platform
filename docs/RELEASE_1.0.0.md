# Versione 1.0.0

Prima release stabile della piattaforma di noleggio DJ.

## Funzionalità principali

- catalogo pubblico cinematografico con categorie, ricerca, prodotti, servizi e gallerie prodotto;
- carrello quantitativo e invio guidato della richiesta di preventivo;
- autenticazione e aree riservate per cliente, collaboratore e owner;
- pratiche, preventivi versionati, conferma esplicita e riepiloghi economici;
- magazzino, disponibilità, opzioni, preparazione, consegna e rientro;
- impostazioni owner, gestione collaboratori e notifiche interne;
- immagini catalogo ottimizzate e contenuti editoriali configurabili;
- Vercel Web Analytics e integrazione Grafana Cloud per Supabase.

## Sicurezza e qualità

- RLS e test negativi per ruoli e dati riservati;
- privilegi delle funzioni `SECURITY DEFINER` ridotti al minimo;
- funzioni trigger non esposte direttamente tramite API;
- listing generale del bucket pubblico del catalogo disabilitato;
- pipeline con lint, type-check, test applicativi, build e test database.

Il sistema non è un e-commerce: una richiesta non costituisce una prenotazione e solo l’owner può confermarla definitivamente.
