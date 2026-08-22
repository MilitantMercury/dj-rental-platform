create or replace function public.reorder_product_images(target_product_id uuid, ordered_image_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select public.current_staff_role()) is distinct from 'owner' then
    raise exception 'Operazione non autorizzata' using errcode = '42501';
  end if;
  if ordered_image_ids is null
     or cardinality(ordered_image_ids) <> (select count(*) from public.product_images where product_id = target_product_id)
     or exists (select 1 from unnest(ordered_image_ids) id group by id having count(*) > 1)
     or exists (select 1 from unnest(ordered_image_ids) id where not exists (select 1 from public.product_images pi where pi.id = id and pi.product_id = target_product_id)) then
    raise exception 'Sequenza immagini non valida' using errcode = '22023';
  end if;
  update public.product_images pi set sort_order = ordered.position * 10
  from unnest(ordered_image_ids) with ordinality as ordered(id, position)
  where pi.id = ordered.id and pi.product_id = target_product_id;
end;
$$;
revoke all on function public.reorder_product_images(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_product_images(uuid, uuid[]) to authenticated;
comment on function public.reorder_product_images(uuid, uuid[]) is 'Salva atomicamente la sequenza completa della galleria prodotto.';