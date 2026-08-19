create or replace function public.campus_rankings(
  _school_id uuid default null,
  _category text default null,
  _days int default 30,
  _limit int default 25
)
returns table(
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  school_id uuid,
  school_name text,
  top_category text,
  completed_orders int,
  rating_avg numeric,
  rating_count int,
  completed_transactions int,
  verification_status text,
  member_since timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  return query
  with recent as (
    select o.seller_user_id as uid,
           l.category as cat,
           count(*)::int as n
    from public.orders o
    join public.listings l on l.id = o.listing_id
    where o.status = 'completed'
      and o.created_at >= now() - make_interval(days => greatest(1, least(_days, 365)))
      and (_category is null or l.category = _category)
    group by o.seller_user_id, l.category
  ),
  totals as (
    select uid, sum(n)::int as orders_n,
           (array_agg(cat order by n desc))[1] as best_cat
    from recent group by uid
  )
  select p.id,
         p.username,
         p.display_name,
         p.avatar_url,
         p.school_id,
         s.name,
         t.best_cat,
         coalesce(t.orders_n, 0),
         p.rating_avg,
         p.rating_count,
         p.completed_transactions,
         p.verification_status,
         p.created_at
  from public.profiles p
  join totals t on t.uid = p.id
  left join public.schools s on s.id = p.school_id
  where p.is_suspended = false
    and (_school_id is null or p.school_id = _school_id)
  order by t.orders_n desc, p.rating_avg desc, p.rating_count desc
  limit greatest(1, least(_limit, 100));
end;
$$;

revoke all on function public.campus_rankings(uuid, text, int, int) from public, anon;
grant execute on function public.campus_rankings(uuid, text, int, int) to authenticated;