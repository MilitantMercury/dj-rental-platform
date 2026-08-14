<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Sistema di noleggio DJ

## Missione

Implementare e mantenere la piattaforma descritta in `docs/Noleggio_DJ_Specifica_Tecnica_Fase_0.md`. La specifica approvata e `docs/DECISIONS.md` prevalgono sulle assunzioni implicite. Non ampliare l'ambito senza registrare la decisione.

## Metodo obbligatorio

1. Prima di modificare codice, leggere la specifica e i documenti pertinenti.
2. Per attività complesse, produrre un piano breve e verificabile.
3. Ispezionare il codice esistente prima di introdurre nuovi pattern.
4. Implementare una sola epic o un singolo risultato coerente per volta.
5. Aggiungere o aggiornare i test insieme al comportamento.
6. Eseguire lint, type-check, test e build prima di dichiarare conclusa l'attività.
7. Riesaminare il diff per regressioni, sicurezza e modifiche fuori ambito.
8. Aggiornare documentazione e changelog quando il comportamento cambia.

## Vincoli funzionali

- Il sistema non è un e-commerce e una richiesta non è una prenotazione.
- Solo l'owner conferma definitivamente una prenotazione.
- Il cliente non vede giacenza reale, disponibilità interna o note amministrative.
- Una richiesta non blocca automaticamente il magazzino.
- Una revisione pubblicata del preventivo è immutabile.
- Ogni modifica economica dopo l'accettazione richiede una nuova revisione e accettazione.
- I record storici usano snapshot e non dipendono dai dati correnti del catalogo.
- Non cancellare fisicamente entità referenziate nello storico.
- Il collaboratore non accede a prezzi, pagamenti o note economiche.
- Operazioni critiche e cambi di stato producono audit.

## Sicurezza e dati

- Applicare RLS a tutte le tabelle esposte e testare esplicitamente i casi negativi.
- Non usare il solo occultamento dell'interfaccia come autorizzazione.
- Verificare l'identità lato server prima delle operazioni protette.
- Non esporre service-role key, segreti o dettagli interni al browser.
- Validare gli input lato server e usare URL firmati brevi per file privati.
- Non registrare password, token, cookie o dati personali superflui nei log.
- Memorizzare importi monetari in centesimi interi.
- Memorizzare date tecniche in UTC e visualizzarle in Europe/Rome.
- Ogni modifica dello schema ha una migrazione versionata; non modificare migrazioni già applicate.
- Seed e fixture non contengono dati personali reali.

## Qualità

- TypeScript strict; evitare `any` salvo motivazione documentata.
- Preferire logica di dominio pura e testabile.
- Rendere atomiche le operazioni concorrenti, soprattutto la conferma della disponibilità.
- Interfacce responsive, semanticamente corrette e utilizzabili da tastiera.
- Testare desktop e mobile per ogni flusso utente.
- Nessun mock permanente o TODO critico può entrare in produzione.

## Comandi di verifica

- Installazione: `npm ci`
- Sviluppo locale: `npm run dev`
- Lint: `npm run lint`
- Type-check: `npm run type-check`
- Test unitari: `npm run test:unit`
- Test integrazione: `npm run test:integration`
- Test end-to-end: `npm run test:e2e`
- Tutti i test non E2E: `npm test`
- Build produzione: `npm run build`
- Avvio Supabase locale: `npm run supabase:start`
- Reset e migrazioni locali: `npm run supabase:reset`
- Test database/RLS: `npx supabase test db`
- Anteprima migrazioni TEST: `npx supabase db push --linked --dry-run`

## Definition of Done

Un'attività è completa soltanto quando comportamento e criteri richiesti sono implementati, i test rilevanti passano, build e controlli statici sono verdi, le autorizzazioni sono verificate, il diff è stato riesaminato e la documentazione necessaria è aggiornata.
