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

## Decisioni aperte

| ID | Decisione richiesta | Necessaria entro |
|---|---|---|
| Q-001 | Nome commerciale, dominio e contatti pubblici. | E2/E3 |
| Q-005 | Listino: prezzo base o regole per evento e durata. | E2/E7 |
| Q-006 | Durata predefinita dell'opzione e comportamento alla scadenza. | E8 |
| Q-007 | Confermare se “In attesa acconto” blocca il magazzino. | E8 |
| Q-008 | Margine operativo globale oppure per prodotto/categoria. | E8 |
| Q-009 | PDF preventivo obbligatorio e numerazione desiderata. | E7 |
| Q-010 | Formati, dimensione e destinatari degli allegati. | E5 |
| Q-011 | Set di dati esposto nei feed ICS. | E12 |
| Q-012 | Logo, palette, font, fotografie, tono e testi pubblici. | E2/E3 |
| Q-013 | Provider, dominio mittente e indirizzi email. | E11 |
| Q-014 | Regole di conservazione e cancellazione dei dati. | E13 |

Nessuna decisione aperta blocca E0 o l'avvio tecnico di E1.
