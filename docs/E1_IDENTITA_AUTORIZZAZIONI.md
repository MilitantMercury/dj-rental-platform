# E1 — Identità e autorizzazioni

## Ambiente

- TEST: `ghnlclmckxaoqptlkelr` (`eu-west-2`).
- PRODUZIONE: non ancora creato; verrà configurato separatamente prima del rilascio.

## Regole

- La registrazione pubblica crea sempre un cliente.
- Il trigger crea `profiles` e `customer_profiles` senza accettare ruoli dai metadata utente.
- Un cliente legge e modifica esclusivamente i propri dati.
- Un collaboratore non accede automaticamente ai clienti; l'accesso per assegnazione arriverà con le pratiche.
- Solo un owner amministra `staff_profiles`; nessuna `service_role` key raggiunge il browser.

## Bootstrap del primo owner

Dopo aver registrato e verificato la propria email, recuperare l'UUID da Authentication → Users ed eseguire una sola volta nel SQL Editor:

```sql
begin;
delete from public.customer_profiles where user_id = '<UUID_OWNER>';
insert into public.staff_profiles (user_id, role, display_name)
values ('<UUID_OWNER>', 'owner', 'Owner');
commit;
```

## Configurazione

Copiare `.env.example` in `.env.local` e valorizzare URL e publishable key TEST. Non inserire la `service_role` key.

Prima di applicare migrazioni remote:

```bash
npx supabase db push --dry-run
npx supabase db push
```
