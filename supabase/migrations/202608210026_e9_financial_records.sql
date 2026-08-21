create table public.financial_records (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete restrict,
  record_type text not null check (record_type in ('deposit_received', 'deposit_returned', 'advance_received', 'balance_received', 'adjustment')),
  amount_cents integer not null check (amount_cents >= 0),
  recorded_on date not null default current_date,
  payment_method text not null default '',
  internal_notes text not null default '',
  recorded_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_records_method_length check (char_length(payment_method) <= 80),
  constraint financial_records_notes_length check (char_length(internal_notes) <= 2000)
);

create index financial_records_request_recorded_on_idx on public.financial_records (request_id, recorded_on desc);
create trigger financial_records_set_updated_at before update on public.financial_records for each row execute function public.set_updated_at();
alter table public.financial_records enable row level security;
create policy "financial records owner all" on public.financial_records for all to authenticated
using ((select public.current_staff_role()) = 'owner')
with check ((select public.current_staff_role()) = 'owner');
revoke all on table public.financial_records from anon;
grant select, insert, update, delete on table public.financial_records to authenticated;
comment on table public.financial_records is 'Registrazioni economiche manuali, visibili e modificabili solo dall’owner.';
