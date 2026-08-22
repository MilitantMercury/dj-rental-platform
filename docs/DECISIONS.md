# Sistema di noleggio DJ — Decision log

Questo registro conserva decisioni e assunzioni che precisano la specifica. Le decisioni approvate prevalgono sulle assunzioni precedenti.

## Decisioni approvate

| ID | Data | Decisione | Motivazione / impatto |
|---|---|---|---|
| D-001 | 2026-08-13 | La sezione 7 della specifica è l'elenco ufficiale degli stati. | Risolve l'incoerenza con l'elenco ridotto della fonte funzionale. |
| D-002 | 2026-08-13 | La piattaforma è single-tenant. | L'MVP serve una sola attività di noleggio. |
| D-003 | 2026-08-13 | Stack: Next.js 16, React, Tailwind CSS, Supabase e Vercel. | Baseline tecnica approvata. |
| D-004 | 2026-08-13 | Ruoli fissi iniziali: `customer`, `collaborator`, `owner`. | Coprono l'MVP; i permessi granulari sono evolutivi. |
| D-005 | 2026-08-13 | Il collaboratore non vede prezzi, pagamenti o note economiche. | Minimo privilegio e separazione delle responsabilità. |
| D-006 | 2026-08-13 | Le revisioni pubblicate dei preventivi sono immutabili; ogni modifica crea una revisione. | Ricostruibilità del contenuto accettato. |
| D-007 | 2026-08-13 | Nessun override manuale della disponibilità nell'MVP. | Impedisce overbooking non tracciabile. |
| D-008 | 2026-08-13 | WhatsApp nell'MVP è un link con messaggio precompilato, senza API. | Evita dipendenze e costi esterni nell'MVP. |
| D-009 | 2026-08-13 | TEST e PRODUZIONE hanno database, file, chiavi e destinatari email separati. | Evita contaminazione dei dati. |
| D-010 | 2026-08-13 | Importi in centesimi interi; date tecniche in UTC e presentazione in Europe/Rome. | Evita errori monetari e ambiguità temporali. |
| D-011 | 2026-08-13 | Gli account GitHub, Supabase, Vercel e degli altri servizi appartengono al proprietario. | Mantiene proprietà e controllo dell'infrastruttura. |
| D-012 | 2026-08-13 | Email verificata prima dell'invio di una richiesta. | Garantisce un recapito valido e limita gli abusi. |
| D-013 | 2026-08-13 | Lingua italiana e valuta EUR. | Contesto operativo approvato. |
| D-014 | 2026-08-13 | Nessun pagamento online, fatturazione elettronica, app nativa o magazzino serializzato nell'MVP. | Confini espliciti dell'MVP. |
| D-015 | 2026-08-17 | In registrazione il cliente sceglie tra privato e Partita IVA. Il privato fornisce nome, cognome e codice fiscale; la Partita IVA fornisce ragione sociale, partita IVA e almeno uno tra PEC e codice destinatario. Telefono e indirizzo sono obbligatori per entrambi. | Raccoglie subito i dati identificativi e di contatto necessari, mostrando soltanto i campi pertinenti al tipo di cliente. |
| D-016 | 2026-08-19 | L’indirizzo anagrafico del cliente è raccolto in via/piazza, civico, CAP, comune, provincia e nazione (Italia predefinita). Gli indirizzi liberi esistenti restano consultabili fino al successivo aggiornamento del profilo. | Consente dati più ordinati e verificabili senza perdere informazioni degli account già creati. |
| D-017 | 2026-08-21 | Per E8 l’opzione ha durata iniziale di 48 ore, configurabile dall’owner; “In attesa acconto” blocca la disponibilità e il margine operativo è globale. | Completa le decisioni necessarie al calcolo della disponibilità temporale senza esporre dati interni al cliente. |
| D-018 | 2026-08-21 | L’eventuale fornitura esterna di materiale è esclusivamente interna: il cliente non vede fornitori, carenze di magazzino, conflitti o l’origine dei pezzi. | Permette di coprire una carenza senza esporre informazioni operative o commerciali interne. |
| D-019 | 2026-08-21 | Gli allegati operativi dell’MVP sono privati, limitati a JPG/PNG/WebP/PDF fino a 10 MB, con URL firmati brevi per owner e collaboratori assegnati. | Copre foto e documenti di consegna/rientro senza esporli pubblicamente. |
| D-020 | 2026-08-21 | Tutti gli importi mostrati o inseriti in interfaccia usano il formato italiano: punto per le migliaia e virgola per i decimali (es. `1.250,50`). | Coerenza con lingua, valuta EUR e abitudini operative italiane; il salvataggio resta in centesimi interi. |
| D-021 | 2026-08-21 | La cauzione indicata nel preventivo è un importo previsto e non genera automaticamente un movimento economico. Incasso e restituzione sono registrati dall’owner soltanto quando avvengono realmente. | Evita di trattare come incassate somme non ancora ricevute e mantiene il registro economico aderente ai fatti. |
| D-022 | 2026-08-21 | Nella conferma definitiva l’owner può dichiarare esplicitamente di avere ricevuto la cauzione: il sistema registra allora, nella stessa operazione atomica, il solo importo ancora mancante e conferma la pratica. Senza dichiarazione esplicita non viene creato alcun movimento. | Riduce passaggi manuali senza creare incassi fittizi; una verifica di disponibilità fallita non lascia una registrazione economica isolata. |
| D-023 | 2026-08-21 | Cliente e owner vedono un riepilogo economico persistente della pratica con totale preventivo, incassato, residuo del noleggio e cauzione da restituire. Il cliente riceve solo aggregati: movimenti, metodi e note interne restano riservati all’owner. | Distingue il valore contrattuale dagli incassi effettivi e rende visibile al cliente la propria situazione senza esporre dati amministrativi. |

## Assunzioni conservative correnti

| ID | Data | Stato | Assunzione | Riesame entro |
|---|---|---|---|---|
| A-001 | 2026-08-13 | Provvisoria | Nome prodotto neutro “Noleggio DJ”; nessun dominio codificato. | E2, prima dei contenuti pubblici definitivi |
| A-002 | 2026-08-13 | Provvisoria | UI E0 con font di sistema e palette neutra scura/ambra, senza asset di brand. | E2/E3, alla consegna del branding |
| A-003 | 2026-08-13 | Provvisoria | Provider email dietro configurazione, senza dipendenza vendor in E0. | E11 |
| A-004 | 2026-08-14 | Provvisoria | E1 viene sviluppata sul solo Supabase TEST `ghnlclmckxaoqptlkelr`; PRODUZIONE sarà creata separatamente prima del rilascio. | Prima del go-live |
| A-005 | 2026-08-14 | Provvisoria | Il primo owner viene promosso una sola volta via SQL amministrativo; la registrazione pubblica crea esclusivamente clienti. | E1 |
| A-006 | 2026-08-14 | Provvisoria | E2 usa prezzo indicativo in centesimi e immagini come metadati di Storage; il bucket e l'upload UI saranno rifiniti prima del catalogo pubblico. | E2/E3 |
| A-007 | 2026-08-14 | Provvisoria | E3 usa un bucket pubblico `catalog` per immagini non riservate; i file di pratiche future resteranno in bucket privati separati. | E5/E13 |
| A-008 | 2026-08-16 | Approvata | Il carrello è sincronizzato lato server per utenti autenticati. Gli anonimi possono consultare il catalogo, ma devono registrarsi o accedere prima di aggiungere articoli e generare una richiesta. Il carrello non blocca disponibilità e non costituisce una prenotazione. | E4/E7 |
| A-009 | 2026-08-19 | Provvisoria | Il primo rilascio di E7 pubblica il preventivo nell’area riservata; il PDF e la relativa numerazione sono differiti finché non saranno definiti come requisito obbligatorio. | Prima del go-live |

## Decisioni aperte

| ID | Decisione richiesta | Necessaria entro |
|---|---|---|
| Q-001 | Nome commerciale, dominio e contatti pubblici. | E2/E3 |
| Q-005 | Listino: prezzo base o regole per evento e durata. | E2/E7 |
| Q-009 | PDF preventivo obbligatorio e numerazione desiderata. | E7 |
| Q-010 | Formati, dimensione e destinatari degli allegati. | E5 |
| Q-011 | Set di dati esposto nei feed ICS. | E12 |
| Q-012 | Logo, palette, font, fotografie, tono e testi pubblici. | E2/E3 |
| Q-013 | Provider, dominio mittente e indirizzi email. | E11 |
| Q-014 | Regole di conservazione e cancellazione dei dati. | E13 |

Nessuna decisione aperta blocca E0 o l'avvio tecnico di E1.
