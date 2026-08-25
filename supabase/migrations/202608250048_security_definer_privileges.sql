-- Normalizza i privilegi delle funzioni SECURITY DEFINER esposte da PostgREST.
-- PostgreSQL concede EXECUTE a PUBLIC per impostazione predefinita: ogni nuova
-- funzione privilegiata deve quindi revocarlo esplicitamente.

drop policy if exists "catalog_public_read" on storage.objects;

revoke all on function public.close_request(uuid, text) from public, anon, authenticated;
revoke all on function public.confirm_request_if_available(uuid, text) from public, anon, authenticated;
revoke all on function public.confirm_request_if_available(uuid, text, boolean, date, text, text) from public, anon, authenticated;
revoke all on function public.create_assignment_notification() from public, anon, authenticated;
revoke all on function public.create_quote_published_notification() from public, anon, authenticated;
revoke all on function public.create_quote_response_notification() from public, anon, authenticated;
revoke all on function public.create_request_notification() from public, anon, authenticated;
revoke all on function public.create_status_notification() from public, anon, authenticated;
revoke all on function public.current_staff_role() from public, anon, authenticated;
revoke all on function public.expire_due_options() from public, anon, authenticated;
revoke all on function public.get_public_app_settings() from public, anon, authenticated;
revoke all on function public.get_request_financial_summary(uuid) from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.place_request_on_option(uuid, text) from public, anon, authenticated;
revoke all on function public.publish_quote_revision(uuid, integer, integer, text) from public, anon, authenticated;
revoke all on function public.register_request_delivery(uuid, text) from public, anon, authenticated;
revoke all on function public.register_request_return(uuid, text) from public, anon, authenticated;
revoke all on function public.respond_to_current_quote(uuid, text, text) from public, anon, authenticated;
revoke all on function public.start_preparation_list(uuid, text) from public, anon, authenticated;
revoke all on function public.submit_quote_request(text, timestamptz, timestamptz, text, text, text, text, text, text, text, text, text, text, boolean) from public, anon, authenticated;

-- Unica RPC intenzionalmente pubblica: restituisce esclusivamente il sottoinsieme
-- di configurazione destinato al sito pubblico.
grant execute on function public.get_public_app_settings() to anon, authenticated;

-- Le RPC applicative richiedono sempre una sessione. I controlli di ruolo e di
-- proprietà rimangono inoltre dentro le funzioni per una difesa a più livelli.
grant execute on function public.current_staff_role() to authenticated;
grant execute on function public.close_request(uuid, text) to authenticated;
grant execute on function public.confirm_request_if_available(uuid, text) to authenticated;
grant execute on function public.confirm_request_if_available(uuid, text, boolean, date, text, text) to authenticated;
grant execute on function public.expire_due_options() to authenticated;
grant execute on function public.get_request_financial_summary(uuid) to authenticated;
grant execute on function public.place_request_on_option(uuid, text) to authenticated;
grant execute on function public.publish_quote_revision(uuid, integer, integer, text) to authenticated;
grant execute on function public.register_request_delivery(uuid, text) to authenticated;
grant execute on function public.register_request_return(uuid, text) to authenticated;
grant execute on function public.respond_to_current_quote(uuid, text, text) to authenticated;
grant execute on function public.start_preparation_list(uuid, text) to authenticated;
grant execute on function public.submit_quote_request(text, timestamptz, timestamptz, text, text, text, text, text, text, text, text, text, text, boolean) to authenticated;

-- Le funzioni create_*_notification e handle_new_auth_user sono entry point di
-- trigger: non devono essere invocabili direttamente via API.
