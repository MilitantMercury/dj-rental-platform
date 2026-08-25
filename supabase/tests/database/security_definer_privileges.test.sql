begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

select is(
  (
    select count(*)
    from unnest(array[
      'public.close_request(uuid,text)'::regprocedure,
      'public.confirm_request_if_available(uuid,text)'::regprocedure,
      'public.confirm_request_if_available(uuid,text,boolean,date,text,text)'::regprocedure,
      'public.create_assignment_notification()'::regprocedure,
      'public.create_quote_published_notification()'::regprocedure,
      'public.create_quote_response_notification()'::regprocedure,
      'public.create_request_notification()'::regprocedure,
      'public.create_status_notification()'::regprocedure,
      'public.current_staff_role()'::regprocedure,
      'public.expire_due_options()'::regprocedure,
      'public.get_request_financial_summary(uuid)'::regprocedure,
      'public.handle_new_auth_user()'::regprocedure,
      'public.place_request_on_option(uuid,text)'::regprocedure,
      'public.publish_quote_revision(uuid,integer,integer,text)'::regprocedure,
      'public.register_request_delivery(uuid,text)'::regprocedure,
      'public.register_request_return(uuid,text)'::regprocedure,
      'public.respond_to_current_quote(uuid,text,text)'::regprocedure,
      'public.start_preparation_list(uuid,text)'::regprocedure,
      'public.submit_quote_request(text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,text,text,text,text,text,boolean)'::regprocedure
    ]) as restricted_function
    where has_function_privilege('anon', restricted_function, 'EXECUTE')
  ),
  0::bigint,
  'L anonimo non puo eseguire funzioni privilegiate'
);

select is(
  (
    select count(*)
    from unnest(array[
      'public.create_assignment_notification()'::regprocedure,
      'public.create_quote_published_notification()'::regprocedure,
      'public.create_quote_response_notification()'::regprocedure,
      'public.create_request_notification()'::regprocedure,
      'public.create_status_notification()'::regprocedure,
      'public.handle_new_auth_user()'::regprocedure
    ]) as trigger_function
    where has_function_privilege('authenticated', trigger_function, 'EXECUTE')
  ),
  0::bigint,
  'Le funzioni trigger non sono richiamabili dagli utenti autenticati'
);

select ok(
  has_function_privilege('anon', 'public.get_public_app_settings()', 'EXECUTE'),
  'Le impostazioni pubbliche restano disponibili senza autenticazione'
);

select ok(
  has_function_privilege('authenticated', 'public.current_staff_role()', 'EXECUTE'),
  'Le policy RLS possono risolvere il ruolo dello staff autenticato'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.submit_quote_request(text,timestamp with time zone,timestamp with time zone,text,text,text,text,text,text,text,text,text,text,boolean)',
    'EXECUTE'
  ),
  'Il cliente autenticato puo ancora inviare una richiesta atomica'
);

select is(
  (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'catalog_public_read'),
  0::bigint,
  'Il bucket pubblico non espone una policy di listing generale'
);

select is(
  (select public from storage.buckets where id = 'catalog'),
  true,
  'Gli URL pubblici delle immagini catalogo restano accessibili'
);

select * from finish();
rollback;
