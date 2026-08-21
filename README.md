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
- conferma esplicita della pratica accettata riservata all’owner, vincolata alla disponibilità del materiale e registrata nel registro attività;
- magazzino owner con giacenza aggregata, materiale temporaneamente fuori servizio, margine operativo globale e durata configurabile delle opzioni;
- opzioni temporanee, verifica atomica della disponibilità alla conferma e copertura interna di eventuale fornitura esterna, mai esposta al cliente;
- registrazioni economiche interne per caparre, acconti, saldi e rettifiche; una caparra prevista deve risultare registrata prima della conferma;
- checklist operativa per preparazione, consegna e rientro, con assegnazione esplicita dei collaboratori e senza accesso a prezzi o dati economici;
- area cliente dei preventivi organizzata per pratica, con storico espandibile delle revisioni pubblicate;
- consultazione del preventivo pubblicato anche dal dettaglio della pratica owner;
- profilo cliente privato o Partita IVA, con controlli sui dati fiscali e indirizzi strutturati;
- tipologie di evento configurabili dal gestore e registro delle attività della pratica.

## Stato operativo: E8–E10

Il ciclo principale ora segue questi passaggi:

- richiesta e preventivo non bloccano mai il magazzino;
- opzione e attesa caparra bloccano temporaneamente il materiale;
- la conferma verifica in modo atomico giacenza, fuori servizio, pratiche sovrapposte e copertura esterna interna;
- la preparazione genera una checklist snapshot del materiale;
- consegna, rientro e chiusura richiedono il completamento delle rispettive verifiche operative.

Rimangono da completare in E10: contenitori di trasporto, allegati/fotografie di consegna e restituzione, e assegnazioni operative più avanzate.

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
