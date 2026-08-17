alter table public.requests
  drop constraint requests_status;

alter table public.requests
  add constraint requests_status
  check (
    status in (
      'received',
      'in_review',
      'quote_draft',
      'quote_published',
      'changes_requested',
      'accepted',
      'confirmed',
      'rejected',
      'cancelled',
      'closed'
    )
  );
