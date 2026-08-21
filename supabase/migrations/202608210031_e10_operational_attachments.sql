insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('operational-attachments', 'operational-attachments', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create table public.request_attachments (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.requests(id) on delete restrict,
  category text not null check (category in ('delivery','return','general')), storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 240), mime_type text not null,
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 10485760), author_id uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now()
);
alter table public.request_attachments enable row level security;
create policy "operational attachments select" on public.request_attachments for select to authenticated using (coalesce((select public.current_staff_role())::text,'')='owner' or exists (select 1 from public.request_assignments a where a.request_id=request_id and a.staff_user_id=(select auth.uid())));
create policy "operational attachments insert" on public.request_attachments for insert to authenticated with check (author_id=(select auth.uid()) and (coalesce((select public.current_staff_role())::text,'')='owner' or exists (select 1 from public.request_assignments a where a.request_id=request_id and a.staff_user_id=(select auth.uid()))));
revoke all on table public.request_attachments from anon;
grant select, insert on table public.request_attachments to authenticated;

create policy "operational storage select" on storage.objects for select to authenticated using (bucket_id='operational-attachments' and (coalesce((select public.current_staff_role())::text,'')='owner' or exists (select 1 from public.request_assignments a where a.request_id=split_part(name,'/',1)::uuid and a.staff_user_id=(select auth.uid()))));
create policy "operational storage insert" on storage.objects for insert to authenticated with check (bucket_id='operational-attachments' and (coalesce((select public.current_staff_role())::text,'')='owner' or exists (select 1 from public.request_assignments a where a.request_id=split_part(name,'/',1)::uuid and a.staff_user_id=(select auth.uid()))));
