# Noleggio DJ

Piattaforma single-tenant per catalogo, richieste, preventivi e gestione del noleggio di attrezzatura DJ. Il sistema non è un e-commerce: una richiesta non è una prenotazione e la conferma definitiva richiede un’azione del gestore.

## Stato del progetto

Sono disponibili:

- autenticazione Supabase con verifica email e ruoli cliente, collaboratore e owner;
- catalogo pubblico e gestione catalogo owner;
- carrello sincronizzato per utente autenticato e richieste cliente con dati evento, location, logistica e privacy;
- area pratiche staff con dettaglio e transizioni di stato auditabili;
- area cliente con accesso isolato alle proprie richieste, preventivi e profilo;
- preventivi con bozze persistenti, revisioni immutabili, pubblicazione e risposta del cliente;
- preventivi composti da voci economiche, con possibilità per il gestore di dividere una quantità richiesta in più righe a prezzo diverso;
- area cliente dei preventivi organizzata per pratica, con storico espandibile delle revisioni pubblicate;
- consultazione del preventivo pubblicato anche dal dettaglio della pratica owner;
- profilo cliente privato o Partita IVA, con controlli sui dati fiscali e indirizzi strutturati;
- tipologie di evento configurabili dal gestore e registro delle attività della pratica.

## Prossimo ciclo: E8 — Magazzino e disponibilità

Il prossimo sviluppo riguarda la disponibilità quantitativa nel tempo: giacenza, materiale fuori servizio, conflitti tra pratiche, opzioni temporanee e margine operativo. Prima di implementarlo restano da definire:

- durata predefinita dell'opzione e relativo comportamento alla scadenza;
- se lo stato “In attesa acconto” blocca la disponibilità;
- margine operativo globale o per prodotto/categoria.

Una richiesta e il carrello non bloccano mai il magazzino; la conferma resta un'azione esplicita del gestore.

## Avvio locale

Richiede Node.js 20.9 o successivo.

```bash
npm ci
npm run dev
```

Aprire `http://localhost:3000`.

Per l’accesso Supabase locale è necessario configurare `.env.local` con l’URL e la publishable key dell’ambiente autorizzato. Il file è escluso dal repository.

## Ambienti e migrazioni

TEST e PRODUZIONE sono ambienti separati. Le migrazioni versionate si trovano in `supabase/migrations` e vengono applicate prima a TEST:

```bash
npx supabase link --project-ref <project-ref-test>
npx supabase db push --linked
```

Non eseguire il link o il push verso PRODUZIONE senza una verifica esplicita dell’ambiente.

## CI

GitHub Actions esegue lint, type-check, test, build e test database/RLS con Supabase locale. Nei repository pubblici, dopo la build applicativa genera anche un'attestazione firmata di provenienza dell'archivio di build; GitHub non offre questa funzione ai repository privati di account personali. Le PR devono avere tutti i controlli verdi prima del merge.

## Verifiche

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e
npm run build
```

La specifica approvata si trova in `docs/Noleggio_DJ_Specifica_Tecnica_Fase_0.md`; le decisioni in `docs/DECISIONS.md`.
