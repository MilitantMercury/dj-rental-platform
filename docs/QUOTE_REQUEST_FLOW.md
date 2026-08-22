# Invio richiesta dal catalogo

Il wizard `/richiesta` è disponibile ai clienti autenticati con email verificata e con almeno una voce nel carrello sincronizzato. Prima dei dati evento mostra il riepilogo di prodotti e servizi che verranno inclusi; la richiesta non blocca disponibilità e non costituisce una prenotazione.

## Transazione atomica

La Server Action valida i dati ricevuti e invoca `submit_quote_request`. La funzione database è l’unico ingresso cliente per la scrittura di `requests` e `request_items`; gli insert diretti sono revocati. In una singola transazione la funzione:

1. verifica identità cliente ed email confermata;
2. valida evento, intervallo, location, logistica, note e consenso privacy;
3. blocca il carrello dell’utente durante la copia;
4. crea la testata e le righe con snapshot descrittivi del catalogo;
5. registra l’audit `request_submitted`;
6. attiva la notifica interna agli owner tramite il trigger della richiesta;
7. svuota il carrello.

Se il carrello è vuoto o una voce è stata disattivata o ritirata dalla pubblicazione, l’intera operazione fallisce e il carrello resta invariato. Gli snapshot non contengono prezzi, disponibilità o note interne; i record storici non dipendono dalle successive modifiche del catalogo.

## Sicurezza e test

Anonimi, owner e collaboratori non possono usare la funzione come clienti. I test pgTAP verificano anche email non confermata, bypass tramite insert diretto, rollback su catalogo cambiato, audit, notifica owner e assenza di prezzi nello snapshot.
