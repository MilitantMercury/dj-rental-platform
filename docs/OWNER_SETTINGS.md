# Impostazioni owner

L’hub `/area-riservata/impostazioni` è riservato agli owner tramite RLS e verifica server-side.

Le regole di opzione e margine operativo alimentano i calcoli di disponibilità. Le modalità logistiche sono esposte al modulo richiesta tramite una funzione pubblica che restituisce solo campi non sensibili. Il nome pubblico viene usato nell’intestazione. Le preferenze per nuove richieste e risposte ai preventivi controllano la creazione delle notifiche interne destinate agli owner.

Le modifiche a `app_settings` e `staff_profiles` producono record append-only in `audit_logs`.

## Collaboratori

L’owner invita un collaboratore via email. Supabase Auth invia il link e l’utente sceglie personalmente la password. Per gli inviti il server richiede `SUPABASE_SERVICE_ROLE_KEY`; la variabile non deve mai avere prefisso `NEXT_PUBLIC_` né essere usata in componenti client.

La sospensione imposta `staff_profiles.active = false`: `current_staff_role()` non restituisce più il ruolo e l’utente perde immediatamente i permessi operativi. I collaboratori non possono essere cancellati fisicamente da questa interfaccia.

## Valori di sistema

Il fuso orario resta fissato a `Europe/Rome`. Gli allegati operativi accettano JPG, PNG, WebP e PDF fino a 10 MB, come stabilito da D-019.
