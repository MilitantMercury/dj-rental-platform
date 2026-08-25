# Noleggio DJ

**Versione stabile:** 1.0.0

Piattaforma single-tenant per catalogo, richieste, preventivi e gestione del noleggio di attrezzatura DJ. Il sistema non è un e-commerce: una richiesta non è una prenotazione e la conferma definitiva richiede un’azione del gestore.

## Stato del progetto

Sono disponibili:

- autenticazione Supabase con verifica email e ruoli cliente, collaboratore e owner;
- hub impostazioni owner e inviti collaboratori (gli inviti richiedono la variabile server-only `SUPABASE_SECRET_KEY`; resta supportata la legacy `SUPABASE_SERVICE_ROLE_KEY`);
- catalogo pubblico e gestione catalogo owner;
- carrello sincronizzato per utente autenticato e richieste cliente con dati evento, location, logistica e privacy;
- area pratiche staff con dettaglio e transizioni di stato auditabili;
- area cliente con accesso isolato alle proprie richieste, preventivi e profilo;
- preventivi con bozze persistenti, revisioni immutabili, pubblicazione e risposta del cliente;
- preventivi composti da voci economiche, con possibilità per il gestore di dividere una quantità richiesta in più righe a prezzo diverso;
- conferma esplicita della pratica accettata riservata all’owner, vincolata alla disponibilità del materiale e registrata nel registro attività;
- magazzino owner con giacenza aggregata, materiale temporaneamente fuori servizio, margine operativo globale e durata configurabile delle opzioni;
- opzioni temporanee, verifica atomica della disponibilità alla conferma e copertura interna di eventuale fornitura esterna, mai esposta al cliente;
- registrazioni economiche interne per caparre, acconti, saldi e rettifiche; una caparra prevista deve risultare registrata prima della conferma;
- checklist operativa per preparazione, consegna e rientro, con assegnazione esplicita dei collaboratori e senza accesso a prezzi o dati economici;
- contenitori di trasporto e allegati privati (foto/PDF) di consegna e rientro, accessibili con URL firmati solo al personale operativo autorizzato;
- area cliente dei preventivi organizzata per pratica, con storico espandibile delle revisioni pubblicate;
- consultazione del preventivo pubblicato anche dal dettaglio della pratica owner;
- profilo cliente privato o Partita IVA, con controlli sui dati fiscali e indirizzi strutturati;
- tipologie di evento configurabili dal gestore e registro delle attività della pratica.
- homepage pubblica con percorso visuale animato che sintetizza registrazione, composizione del setup, verifica e consegna o ritiro.
- footer istituzionale condiviso dal layout e presente in fondo a tutte le pagine.
- galleria immagini prodotto ordinabile dall’owner e navigabile nel catalogo con frecce, miniature, tastiera e swipe.
- selezione editoriale “In copertina” di un solo prodotto e un solo servizio per la composizione cinematografica del catalogo pubblico; la sostituzione è atomica e richiede un contenuto attivo, pubblicato e illustrato.
- Vercel Web Analytics integrato nel layout globale per misurare visite e visualizzazioni delle pagine nell’ambiente distribuito.
- Grafana Cloud collegato alla Metrics API Supabase per osservare salute, connessioni e prestazioni del database distribuito.
- privilegi Supabase delle funzioni `SECURITY DEFINER` ridotti al minimo, funzioni trigger non esposte via API e bucket pubblico del catalogo non enumerabile.

## Stato operativo: E8–E10

Il ciclo principale ora segue questi passaggi:

- richiesta e preventivo non bloccano mai il magazzino;
- opzione e attesa caparra bloccano temporaneamente il materiale;
- la conferma verifica in modo atomico giacenza, fuori servizio, pratiche sovrapposte e copertura esterna interna;
- la preparazione genera una checklist snapshot del materiale;
- consegna, rientro e chiusura richiedono il completamento delle rispettive verifiche operative.

Rimangono da completare in E10: assegnazioni operative più avanzate e l’eventuale evoluzione della checklist con ulteriori controlli operativi.

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

GitHub Actions esegue lint, type-check, test, build e test database/RLS con Supabase locale. La cache di build di Next.js, gestita da `actions/cache@v5` su Node 24, viene ripristinata tra le esecuzioni per ridurre i tempi di compilazione: il primo run con una chiave nuova è normalmente un cache miss, mentre i successivi mostrano esplicitamente `Cache Next.js hit=true` nel log. Nei repository pubblici, dopo la build applicativa genera anche un'attestazione firmata di provenienza dell'archivio di build; GitHub non offre questa funzione ai repository privati di account personali. Le PR devono avere tutti i controlli verdi prima del merge.

## Verifiche

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e
npm run build
```

La specifica approvata si trova in `docs/Noleggio_DJ_Specifica_Tecnica_Fase_0.md`; le decisioni in `docs/DECISIONS.md`.

Le regole di hardening e la configurazione Auth manuale sono documentate in `docs/SUPABASE_SECURITY.md`.
La copertura di monitoraggio Vercel/Grafana è descritta in `docs/OBSERVABILITY.md`.
