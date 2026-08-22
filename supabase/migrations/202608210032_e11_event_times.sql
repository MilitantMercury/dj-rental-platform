alter table public.requests add column event_start_at timestamptz;
alter table public.requests add column event_end_at timestamptz;
update public.requests set event_start_at = (event_date::timestamp at time zone 'Europe/Rome'), event_end_at = ((event_end_date::timestamp + interval '23 hours 59 minutes') at time zone 'Europe/Rome') where event_start_at is null;
alter table public.requests alter column event_start_at set not null;
alter table public.requests alter column event_end_at set not null;
alter table public.requests add constraint requests_event_times check (event_end_at > event_start_at);
