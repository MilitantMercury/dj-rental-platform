alter table public.requests
  add column delivery_responsibility text not null default 'customer',
  add column pickup_responsibility text not null default 'customer';

alter table public.requests
  add constraint requests_delivery_responsibility_check check (delivery_responsibility in ('owner','customer')),
  add constraint requests_pickup_responsibility_check check (pickup_responsibility in ('owner','customer'));
