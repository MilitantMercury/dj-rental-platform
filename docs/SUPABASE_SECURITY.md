# Hardening Supabase

## Privilegi delle funzioni

Le funzioni `SECURITY DEFINER` non ereditano i normali limiti RLS del chiamante. Per questo ogni funzione privilegiata deve revocare esplicitamente `EXECUTE` a `PUBLIC`, `anon` e `authenticated`, concedendolo nuovamente soltanto ai ruoli applicativi necessari.

Le funzioni usate esclusivamente dai trigger, incluse quelle che generano notifiche e `handle_new_auth_user`, non sono richiamabili tramite le API. Le RPC operative restano disponibili a `authenticated` e continuano a verificare identità, proprietà e ruolo al loro interno. `get_public_app_settings()` è l’unica eccezione anonima intenzionale e restituisce soltanto configurazione destinata al sito pubblico.

## Storage pubblico

Il bucket `catalog` è pubblico perché contiene esclusivamente immagini pubblicate nel catalogo. Gli URL pubblici non richiedono una policy `SELECT` generale su `storage.objects`; tale policy è stata rimossa per impedire l’enumerazione completa dei file. Scrittura, modifica e cancellazione restano riservate all’owner.

## Password compromesse

La protezione dalle password compromesse è una configurazione dell’ambiente Supabase Auth e non una migrazione PostgreSQL. È disponibile soltanto dal piano Pro: negli ambienti compatibili va abilitata dal dashboard in **Authentication → Sign In / Providers → Email → Prevent use of leaked passwords**. Sul piano Free l’avviso `auth_leaked_password_protection` è un rischio residuo accettato; restano attivi lunghezza minima, requisiti di complessità e cambio password sicuro.

## Verifica

I test pgTAP in `supabase/tests/database/security_definer_privileges.test.sql` verificano i casi negativi per anonimi e utenti autenticati, l’eccezione pubblica delle impostazioni e l’assenza della policy di listing del bucket.
