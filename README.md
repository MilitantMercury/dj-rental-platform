# Noleggio DJ

Piattaforma single-tenant per catalogo, richieste, preventivi e gestione del noleggio di attrezzatura DJ. Il sistema non è un e-commerce: una richiesta non è una prenotazione e la conferma definitiva richiede un’azione del gestore.

## Stato del progetto

Sono disponibili:

- autenticazione Supabase con verifica email e ruoli cliente, collaboratore e owner;
- catalogo pubblico e gestione catalogo owner;
- richieste cliente con dati evento, logistica e privacy;
- area pratiche staff con dettaglio e transizioni di stato auditabili;
- area cliente con accesso isolato alle proprie richieste;
- fondamenta preventivi, revisioni, voci e risposte cliente in Supabase.

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

GitHub Actions esegue lint, type-check, test, build e test database/RLS con Supabase locale. Le PR devono avere tutti i controlli verdi prima del merge.

## Verifiche

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e
npm run build
```

La specifica approvata si trova in `docs/Noleggio_DJ_Specifica_Tecnica_Fase_0.md`; le decisioni in `docs/DECISIONS.md`.
