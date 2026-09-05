create table public.page_counters (
  page_path text primary key,
  visit_count bigint not null default 0 check (visit_count >= 0),
  updated_at timestamptz not null default now()
);

create table public.writings_visitors (
  visitor_id uuid primary key,
  ordinal bigint unique,
  visited_at timestamptz not null default now()
);

alter table public.page_counters enable row level security;
alter table public.writings_visitors enable row level security;

revoke all on public.page_counters from anon, authenticated;
revoke all on public.writings_visitors from anon, authenticated;

create or replace function public.record_writings_visit(p_visitor_id uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_ordinal bigint;
  is_new_visitor boolean;
begin
  insert into public.writings_visitors (visitor_id)
  values (p_visitor_id)
  on conflict (visitor_id) do nothing;

  is_new_visitor := found;

  if is_new_visitor then
    insert into public.page_counters (page_path, visit_count)
    values ('/writings', 1)
    on conflict (page_path) do update
      set visit_count = public.page_counters.visit_count + 1,
          updated_at = now()
    returning visit_count into assigned_ordinal;

    update public.writings_visitors
    set ordinal = assigned_ordinal
    where visitor_id = p_visitor_id;
  else
    select ordinal
    into assigned_ordinal
    from public.writings_visitors
    where visitor_id = p_visitor_id;
  end if;

  return assigned_ordinal;
end;
$$;

revoke all on function public.record_writings_visit(uuid) from public;
grant execute on function public.record_writings_visit(uuid) to anon, authenticated;
