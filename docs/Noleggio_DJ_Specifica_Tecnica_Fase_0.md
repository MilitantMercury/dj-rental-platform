# Sistema di noleggio attrezzatura DJ

## Specifica tecnica e piano di realizzazione - Fase 0

**Versione:** 0.1  
**Data:** 13 agosto 2026  
**Fonte funzionale:** Analisi Funzionale - Sistema di noleggio attrezzatura DJ - Versione 4.0  
**Stato:** baseline tecnica approvata per l'avvio di E0; decisioni specifiche delle epic successive ancora aperte

## 1. Obiettivo

Realizzare una piattaforma web responsive per gestire l'intero processo di richiesta, preventivazione e noleggio di attrezzatura e servizi professionali. La piattaforma non è un e-commerce: nessuna richiesta costituisce automaticamente una prenotazione e ogni conferma definitiva rimane sotto il controllo del gestore.

Il prodotto comprende:

- sito pubblico con catalogo di prodotti e servizi;
- procedura guidata per la richiesta di preventivo;
- area riservata cliente;
- pannello amministrativo per gestore e collaboratori;
- preventivi con revisioni immutabili e accettazione del cliente;
- gestione quantitativa del magazzino e della disponibilità temporale;
- registrazione manuale di acconto, saldo e cauzione;
- preparazione, consegna o ritiro e restituzione del materiale;
- notifiche email e calendari iCalendar in sola lettura;
- ambienti separati TEST e PRODUZIONE.

## 2. Principi vincolanti

1. Il gestionale è la fonte ufficiale dei dati.
2. Il cliente non vede giacenza, disponibilità reale, prezzi interni o note amministrative.
3. Una richiesta non blocca il magazzino.
4. Solo gli stati configurati come bloccanti incidono sulla disponibilità.
5. La conferma di una prenotazione è sempre un'azione esplicita del gestore.
6. Un preventivo pubblicato non viene modificato: ogni cambiamento crea una nuova revisione.
7. L'accettazione riguarda una revisione precisa e non può essere trasferita a revisioni successive.
8. Una modifica economica dopo l'accettazione richiede una nuova revisione e una nuova accettazione.
9. Prodotti, servizi e categorie disattivati rimangono nello storico.
10. Le operazioni critiche devono essere registrate nell'audit log.
11. Tutte le date saranno memorizzate in UTC e presentate nel fuso Europe/Rome.
12. Gli importi saranno memorizzati in centesimi di euro, evitando valori floating point.

## 3. Ambito MVP consolidato

### Incluso

- catalogo pubblico con categorie, sottocategorie, prodotti, servizi e immagini;
- registrazione, login, logout e recupero password;
- profilo cliente e storico delle pratiche;
- carrello temporaneo e procedura guidata di richiesta;
- modalità ritiro in sede oppure consegna e ritiro del gestore;
- dati evento, logistica, privacy e note;
- back-office responsive;
- gestione catalogo e contenuti;
- pratiche, ricerca, filtri, note interne e allegati;
- workflow completo definito nella sezione 7;
- preventivi, voci economiche, revisioni e accettazione/rifiuto;
- registrazione manuale di acconto, saldo e cauzione;
- disponibilità quantitativa, fuori servizio, opzioni e margine operativo;
- checklist di preparazione e registrazione di consegna/restituzione;
- email transazionali configurabili;
- due feed ICS: richieste/opzioni e prenotazioni confermate;
- ruoli e autorizzazioni;
- audit log;
- test automatici e tracciamento degli errori applicativi.

### Escluso

- pagamenti online;
- fatturazione elettronica e funzioni fiscali;
- app native o funzionamento offline;
- magazzino serializzato, QR o barcode;
- pianificazione automatica dei professionisti;
- calcolo automatico del trasporto;
- firma elettronica;
- documentazione fotografica di consegna e restituzione;
- sincronizzazione bidirezionale dei calendari;
- invio automatico tramite API WhatsApp Business;
- integrazioni ERP, CRM o contabilità.

## 4. Architettura proposta

### Stack

- **Applicazione:** Next.js 16, App Router, TypeScript in modalità strict.
- **Interfaccia:** React, Tailwind CSS e componenti accessibili.
- **Database:** PostgreSQL gestito tramite Supabase.
- **Autenticazione:** Supabase Auth, email e password.
- **Autorizzazione:** Row Level Security più controlli server-side.
- **File:** Supabase Storage con bucket e policy distinti per file pubblici e riservati.
- **Hosting:** Vercel.
- **Email:** provider transazionale configurabile; prima scelta Resend.
- **Monitoraggio:** log strutturati e servizio di error tracking configurabile.
- **Test:** unitari, integrazione database e test end-to-end sui flussi critici.

### Ambienti

| Ambiente | Branch indicativa | Database | Utilizzo |
|---|---|---|---|
| Locale | feature/* | Supabase locale o DEV | sviluppo e test automatici |
| TEST | develop | Supabase TEST | collaudo funzionale del committente |
| PRODUZIONE | main | Supabase PROD | servizio reale |

TEST e PRODUZIONE non condivideranno database, file, chiavi o destinatari email. Le migrazioni saranno versionate nel repository e applicate prima in TEST.

## 5. Attori e autorizzazioni

| Funzione | Cliente | Collaboratore | Gestore/Owner |
|---|:---:|:---:|:---:|
| Consultare catalogo pubblico | Sì | Sì | Sì |
| Gestire il proprio profilo | Sì | Sì | Sì |
| Vedere le proprie pratiche | Sì | - | - |
| Accettare/rifiutare preventivi propri | Sì | - | - |
| Vedere lista operativa senza prezzi | - | Sì | Sì |
| Aggiornare checklist di preparazione | - | Sì | Sì |
| Vedere dati essenziali del cliente | - | Sì, se assegnato | Sì |
| Vedere prezzi e pagamenti | Solo propri | No | Sì |
| Gestire catalogo e magazzino | No | No | Sì |
| Gestire preventivi e revisioni | No | No | Sì |
| Confermare/annullare pratiche | No | No | Sì |
| Gestire utenti e configurazione | No | No | Sì |
| Consultare audit log completo | No | No | Sì |

Assunzione v0.1: il collaboratore è un ruolo operativo privo di accesso economico. Eventuali permessi granulari saranno una futura evoluzione, salvo diversa decisione prima dello sviluppo.

## 6. Modello dati logico

Ogni tabella applicativa contiene almeno `id`, `created_at` e `updated_at`, ove applicabile. La cancellazione fisica è evitata per entità già presenti in pratiche o preventivi.

### Identità e configurazione

| Entità | Scopo | Campi principali |
|---|---|---|
| `profiles` | Profilo collegato all'utente Auth | user_id, nome, cognome, telefono, tipo profilo |
| `customer_profiles` | Dati aggiuntivi cliente | azienda, CF, P.IVA, indirizzo, note |
| `staff_profiles` | Gestore e collaboratori | ruolo, attivo, nome visualizzato |
| `app_settings` | Configurazione generale | timezone, margine operativo, durata opzione, contatti, email |
| `event_types` | Tipologie evento configurabili | nome, descrizione, attivo, ordine |
| `privacy_documents` | Versioni dell'informativa | versione, testo/URL, pubblicata_il |
| `privacy_acceptances` | Prova di presa visione | utente, versione, data, IP, user agent |

### Catalogo e magazzino

| Entità | Scopo | Campi principali |
|---|---|---|
| `categories` | Categorie e sottocategorie | parent_id, nome, slug, descrizione, immagine, ordine, stato |
| `products` | Attrezzature noleggiabili | categoria, nome, slug, descrizione, specifiche, accessori inclusi, prezzo riferimento, stato |
| `product_images` | Galleria prodotto | product_id, file, alt text, ordine |
| `services` | Servizi professionali | categoria, nome, descrizione, prezzo indicativo, condizioni, stato |
| `inventory_stock` | Quantità aggregata | product_id, quantità totale |
| `inventory_unavailability` | Quantità fuori servizio | product_id, quantità, periodo, motivo, note |

### Pratiche

| Entità | Scopo | Campi principali |
|---|---|---|
| `requests` | Testata della pratica | codice, cliente, stato, date noleggio, evento, modalità, logistica, note cliente/interne |
| `request_products` | Prodotti richiesti | request_id, product_id, snapshot descrittivo, quantità |
| `request_services` | Servizi richiesti | request_id, service_id, snapshot descrittivo, dettagli operativi |
| `request_assignments` | Collaboratori assegnati | request_id, staff_id, ruolo operativo |
| `request_status_history` | Cronologia stati | request_id, stato precedente/nuovo, autore, data, nota |
| `request_messages` | Richieste di modifica/comunicazioni | request_id, autore, visibilità, messaggio |
| `attachments` | File associati alla pratica | request_id, autore, categoria, file, visibilità |

Gli snapshot impediscono che la modifica futura di un prodotto o servizio alteri una pratica storica.

### Preventivi ed economia

| Entità | Scopo | Campi principali |
|---|---|---|
| `quotes` | Contenitore del preventivo della pratica | request_id, revisione corrente |
| `quote_revisions` | Versioni immutabili | quote_id, numero, stato, valuta, subtotale, sconto, totale, cauzione, condizioni, pubblicata_il |
| `quote_items` | Voci della singola revisione | revision_id, tipo, descrizione snapshot, quantità, prezzo unitario, sconto, totale, ordine |
| `quote_responses` | Risposta del cliente | revision_id, cliente, esito, commento, data, IP, user agent |
| `financial_records` | Registrazioni manuali | request_id, tipo acconto/saldo/cauzione/restituzione, importo, data, metodo, nota, autore |

Una revisione pubblicata è immutabile. La revisione successiva viene costruita copiando quella precedente e riceve un nuovo numero progressivo.

### Esecuzione operativa

| Entità | Scopo | Campi principali |
|---|---|---|
| `preparation_lists` | Testata checklist | request_id, stato, iniziata/conclusa_il |
| `preparation_items` | Materiale da preparare | origine, descrizione snapshot, prevista, preparata, consegnata, restituita, stato, note |
| `transport_containers` | Contenitori usati | request_id, tipo, descrizione, quantità, note |
| `calendar_tokens` | Token revocabili per feed ICS | calendario, token hash, attivo |
| `email_events` | Coda e storico email | evento, destinatario, template, stato, tentativi, errore |
| `audit_logs` | Tracciamento operazioni critiche | attore, azione, entità, id entità, dati precedenti/successivi, data |

## 7. Workflow ufficiale

La sezione 7 dell'Analisi Funzionale v4 è assunta come fonte ufficiale.

| Stato | Visibile al cliente | Blocca disponibilità | Ingresso tipico |
|---|:---:|:---:|---|
| Richiesta ricevuta | Sì | No | invio richiesta |
| In verifica | Sì | No | presa in carico |
| In attesa servizi | Sì | No | verifica professionisti |
| Preventivo in preparazione | Sì | No | creazione/revisione |
| Preventivo inviato | Sì | No | pubblicazione revisione |
| In attesa risposta cliente | Sì | No | dopo notifica cliente |
| In opzione | Sì | Sì, fino a scadenza | riserva temporanea gestore |
| In attesa acconto | Sì | Assunzione: sì | preventivo accettato con acconto previsto |
| Confermata | Sì | Sì | conferma esplicita gestore |
| In preparazione | Sì | Sì | avvio checklist |
| Consegnata / Ritirata | Sì | Sì | materiale affidato al cliente |
| Restituita | Sì | Sì fino a verifica | restituzione registrata |
| Chiusa | Sì | No | verifiche ed economia concluse |
| Rifiutata | Sì | No | rifiuto cliente o gestore |
| Annullata | Sì | No | annullamento |
| Scaduta | Sì | No | scadenza preventivo/opzione |

### Transizioni iniziali consentite

- Richiesta ricevuta -> In verifica, Rifiutata, Annullata
- In verifica -> In attesa servizi, Preventivo in preparazione, Rifiutata, Annullata
- In attesa servizi -> In verifica, Preventivo in preparazione, Rifiutata, Annullata
- Preventivo in preparazione -> Preventivo inviato, In verifica, Annullata
- Preventivo inviato -> In attesa risposta cliente, In opzione, Annullata
- In attesa risposta cliente -> Preventivo in preparazione, In opzione, In attesa acconto, Confermata, Rifiutata, Scaduta, Annullata
- In opzione -> Preventivo in preparazione, In attesa acconto, Confermata, Scaduta, Annullata
- In attesa acconto -> Confermata, Preventivo in preparazione, Scaduta, Annullata
- Confermata -> In preparazione, Annullata
- In preparazione -> Consegnata / Ritirata, Confermata, Annullata
- Consegnata / Ritirata -> Restituita
- Restituita -> Chiusa, Consegnata / Ritirata

Riaperture eccezionali e correzioni dopo la chiusura richiederanno un'azione owner, una motivazione obbligatoria e audit.

## 8. Regole di disponibilità

Per ogni prodotto e intervallo richiesto:

`disponibilità = giacenza totale - fuori servizio - massimo impegnato nelle sovrapposizioni`

Una prenotazione si sovrappone quando il suo intervallo, esteso del margine operativo configurato, interseca l'intervallo richiesto. Il calcolo deve considerare la quantità impegnata contemporaneamente, non la semplice somma di tutte le pratiche del periodo.

### Regole

- una richiesta non prenota quantità;
- uno stato bloccante prenota la quantità contenuta nell'ultima revisione attiva o, se non esiste, nella richiesta;
- le opzioni scadute non bloccano;
- le quantità fuori servizio possono avere un intervallo oppure essere indefinite;
- la conferma fallisce in modo atomico se la disponibilità è cambiata nel frattempo;
- il gestore vede disponibilità, conflitti e pratiche concorrenti;
- il cliente non vede quantità o conflitti;
- nessun override manuale è previsto nella v0.1: una conferma incompatibile viene impedita.

## 9. Preventivi e accettazione

1. L'invio della richiesta crea una bozza privata.
2. Il gestore modifica voci, prezzi, sconti, trasporto, servizi, cauzione e condizioni.
3. La pubblicazione congela la revisione e la rende visibile al cliente.
4. Il sistema invia l'email e registra l'esito del tentativo.
5. Il cliente può accettare, rifiutare o richiedere modifiche.
6. L'accettazione registra revisione, data, utente e dati tecnici minimi di prova.
7. Una nuova revisione invalida qualsiasi accettazione precedente ai fini della conferma.
8. La conferma finale richiede disponibilità valida e revisione corrente accettata, salvo decisione esplicita e motivata del gestore.

Assunzione v0.1: ogni revisione pubblicata avrà anche una rappresentazione PDF scaricabile e archiviata, per mantenere un documento stabile nel tempo.

## 10. Sicurezza e privacy

- RLS attiva su tutte le tabelle esposte.
- Il cliente può leggere esclusivamente righe collegate al proprio `user_id`.
- Il collaboratore può leggere solo pratiche assegnate e campi operativi autorizzati.
- Prezzi, registrazioni finanziarie e note interne non sono mai esposti al ruolo collaboratore.
- Le operazioni amministrative usano funzioni server-side e verificano il ruolo.
- I file privati sono serviti con URL firmati a breve durata.
- Token ICS casuali, revocabili e non contenenti identificativi prevedibili.
- Rate limiting su login, recupero password, invio richiesta e azioni cliente.
- Validazione server-side di ogni input.
- Nessun segreto nel browser o nel repository.
- Audit obbligatorio per pubblicazione preventivo, risposta cliente, registrazioni economiche, conferma, annullamento, cambio disponibilità e gestione utenti.
- Politiche di conservazione e cancellazione dati da definire con il titolare del trattamento.

## 11. Email e calendario

### Email minime

- conferma ricezione richiesta al cliente;
- nuova richiesta al gestore;
- nuova revisione al cliente;
- accettazione/rifiuto al gestore;
- cambio di stato configurato;
- conferma prenotazione;
- comunicazioni operative opzionali.

Gli invii devono essere idempotenti: un retry non deve creare duplicati. In TEST tutte le email saranno reindirizzate a destinatari sicuri o marcate chiaramente come test.

### Calendari ICS

- feed richieste e opzioni;
- feed prenotazioni confermate;
- sola lettura;
- URL protetti da token revocabile;
- dati sensibili ridotti al minimo e configurabili;
- aggiornamento derivato dai dati correnti del gestionale.

## 12. Backlog di implementazione

| Epic | Contenuto | Dipendenze | Uscita verificabile |
|---|---|---|---|
| E0 Fondamenta | repository, CI, ambienti, design system, configurazione | decisioni iniziali | build, lint e test verdi |
| E1 Identità | Auth, profili, ruoli, recupero password, RLS | E0 | accessi separati e test autorizzazioni |
| E2 Catalogo admin | categorie, prodotti, servizi, immagini, stati | E1 | CRUD completo e storico preservato |
| E3 Catalogo pubblico | navigazione, ricerca, schede, carrello | E2 | flusso responsive senza prezzi pubblici |
| E4 Richiesta | wizard, evento, logistica, privacy, invio | E3 | richiesta e bozza create atomicamente |
| E5 Pratiche admin | lista, filtri, dettaglio, note, allegati, stati | E4 | workflow e audit funzionanti |
| E6 Area cliente | elenco, dettaglio, documenti, messaggi | E4 | isolamento dati verificato |
| E7 Preventivi | revisioni, voci, PDF, pubblicazione, risposta | E5-E6 | revisioni immutabili e nuova accettazione |
| E8 Magazzino | giacenza, fuori servizio, conflitti, opzioni, margine | E5 | test sovrapposizioni e concorrenza |
| E9 Economia | acconto, saldo, cauzione, stati manuali | E7 | calcoli e audit corretti |
| E10 Operatività | checklist, contenitori, consegna, restituzione | E8-E9 | ciclo completo fino a chiusura |
| E11 Comunicazioni | email, template, storico, retry | E4-E10 | eventi idempotenti verificati |
| E12 Calendari | feed ICS, token, spostamento tra feed | E5-E10 | sottoscrizione e aggiornamento corretti |
| E13 Hardening | accessibilità, performance, sicurezza, backup, collaudo | tutti | criteri di accettazione superati |
| E14 Go-live | dati iniziali, dominio, produzione, runbook | E13 | rilascio ripetibile e rollback documentato |

## 13. Strategia di test

### Test unitari

- calcolo importi, sconti, saldo e cauzione;
- sovrapposizione intervalli e margine operativo;
- transizioni di stato;
- scadenza opzioni;
- generazione codici pratica;
- costruzione eventi ICS.

### Test di integrazione

- policy RLS per ogni ruolo;
- creazione atomica richiesta e bozza;
- pubblicazione e clonazione revisioni;
- conferma concorrente dell'ultima unità disponibile;
- disattivazione prodotti senza perdita dello storico;
- retry email senza duplicazione;
- accesso autorizzato agli allegati.

### Test end-to-end obbligatori

1. Cliente si registra, crea richiesta e riceve conferma.
2. Gestore prende in carico e pubblica un preventivo.
3. Cliente richiede modifiche; il gestore pubblica una nuova revisione.
4. Cliente accetta la revisione corrente; il gestore conferma.
5. Una seconda pratica incompatibile viene bloccata.
6. Il materiale viene preparato, consegnato, restituito e la pratica chiusa.
7. Cliente A non può visualizzare dati del Cliente B.
8. Collaboratore non può visualizzare dati economici.
9. La prenotazione passa correttamente tra i due feed ICS.
10. Prodotti disattivati restano leggibili nello storico.

## 14. Definition of Done

Una epic è completa solo quando:

- requisiti e criteri di accettazione sono soddisfatti;
- non contiene placeholder o funzioni simulate non dichiarate;
- migrazioni e seed sono versionati e ripetibili;
- test pertinenti sono presenti e superati;
- lint, type-check e build sono verdi;
- autorizzazioni e casi negativi sono testati;
- interfaccia verificata su desktop e viewport mobile;
- accessibilità essenziale verificata da tastiera;
- errori mostrano messaggi comprensibili e non espongono dettagli sensibili;
- documentazione e changelog sono aggiornati;
- Codex effettua una revisione finale del diff.

## 15. Decisioni richieste al proprietario

### Decisioni E0/E1 approvate il 13 agosto 2026

1. GitHub, Supabase, Vercel e gli altri servizi appartengono agli account di Andrea.
2. La piattaforma è single-tenant e serve esclusivamente questo cliente.
3. Il cliente deve verificare l'indirizzo email prima di poter inviare una richiesta.
4. Il nome commerciale e il dominio possono essere definiti durante E0 senza influire sul modello dati.

### Bloccanti prima delle epic interessate

6. Listini: semplice prezzo base per prodotto oppure prezzi per tipologia evento/durata.
7. Durata predefinita dell'opzione e comportamento alla scadenza.
8. Lo stato “In attesa acconto” deve bloccare il magazzino?
9. Margine operativo unico globale oppure configurabile per prodotto/categoria.
10. PDF del preventivo obbligatorio e numerazione desiderata.
11. Limiti e formati degli allegati.
12. Dati da mostrare nei feed ICS.
13. Indirizzo e mittente delle email.
14. Logo, colori, font, fotografie e testi pubblici.
15. Regole di privacy, conservazione e cancellazione definite dal titolare.

## 16. Assunzioni adottate nella v0.1

- una sola attività di noleggio, non SaaS multi-tenant;
- lingua italiana ed euro;
- fuso Europe/Rome;
- ruoli fissi: cliente, collaboratore e owner;
- email verificata prima di operazioni sensibili;
- sezione 7 del documento funzionale come elenco ufficiale degli stati;
- collaboratore operativo senza prezzi;
- `In opzione`, `In attesa acconto`, `Confermata`, `In preparazione`, `Consegnata/Ritirata` e `Restituita` bloccano quantità;
- opzione con scadenza configurabile globale;
- margine operativo globale;
- preventivo pubblicato disponibile anche in PDF;
- WhatsApp limitato a pulsante/link con messaggio precompilato;
- nessun override della disponibilità nell'MVP.

Queste assunzioni restano modificabili prima dell'epic coinvolta. Ogni variazione successiva dovrà essere registrata nel decision log.

## 17. Criterio di avvio implementazione

L'implementazione può iniziare perché sono stati confermati:

- proprietà degli account in capo ad Andrea;
- natura single-tenant;
- verifica email obbligatoria prima dell'invio della richiesta;
- stack proposto e assunzioni che incidono su schema dati e autorizzazioni.

Le decisioni su contenuti, listini, PDF e calendario possono essere completate durante le epic precedenti, purché prima dello sviluppo della funzione interessata.
