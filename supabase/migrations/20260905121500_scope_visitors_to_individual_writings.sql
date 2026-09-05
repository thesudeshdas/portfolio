drop function public.record_writings_visit(uuid);

truncate table public.writings_visitors;
truncate table public.page_counters;

alter table public.writings_visitors
  drop constraint writings_visitors_pkey,
  drop constraint writings_visitors_ordinal_key,
  add column page_path text not null,
  add primary key (page_path, visitor_id),
  add unique (page_path, ordinal);

create or replace function public.record_writing_visit(
  p_slug text,
  p_visitor_id uuid
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_ordinal bigint;
  is_new_visitor boolean;
  writing_path text;
begin
  if p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug) > 100 then
    raise exception 'Invalid writing slug';
  end if;

  writing_path := '/writings/' || p_slug;

  insert into public.writings_visitors (page_path, visitor_id)
  values (writing_path, p_visitor_id)
  on conflict (page_path, visitor_id) do nothing;

  is_new_visitor := found;

  if is_new_visitor then
    insert into public.page_counters (page_path, visit_count)
    values (writing_path, 1)
    on conflict (page_path) do update
      set visit_count = public.page_counters.visit_count + 1,
          updated_at = now()
    returning visit_count into assigned_ordinal;

    update public.writings_visitors
    set ordinal = assigned_ordinal
    where page_path = writing_path
      and visitor_id = p_visitor_id;
  else
    select ordinal
    into assigned_ordinal
    from public.writings_visitors
    where page_path = writing_path
      and visitor_id = p_visitor_id;
  end if;

  return assigned_ordinal;
end;
$$;

revoke all on function public.record_writing_visit(text, uuid) from public;
grant execute on function public.record_writing_visit(text, uuid)
  to anon, authenticated;
