# Notifiche interne

Le notifiche interne completano, senza sostituire, le comunicazioni email previste dalla specifica.

## Eventi MVP

- nuova richiesta: tutti gli owner attivi;
- cambio di stato: cliente titolare della pratica, salvo azioni eseguite dal cliente stesso;
- pubblicazione di una revisione: cliente titolare della pratica;
- risposta a un preventivo: tutti gli owner attivi;
- assegnazione di una pratica: collaboratore assegnato.

I record sono creati da trigger database con una chiave evento idempotente. Titolo e testo non includono prezzi, pagamenti, note interne o disponibilità di magazzino.

## Autorizzazioni

RLS consente a ogni utente autenticato di leggere esclusivamente le proprie notifiche. L’unica colonna modificabile dal destinatario è `read_at`; creazione e modifica del contenuto non sono concesse al ruolo `authenticated`.

La campanella mostra il numero di notifiche non lette. La pagina `/area-riservata/notifiche` espone le ultime 100 notifiche e permette di segnarle come lette singolarmente o in blocco e di riportare una notifica letta allo stato non letto.
