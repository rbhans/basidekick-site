-- Account-backed saves and recent views for the replacement workspace.
create table if not exists public.user_saved_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('news', 'wiki', 'pointstack', 'library', 'course')),
  entity_id text not null,
  title text not null check (char_length(title) between 1 and 240),
  href text not null check (href ~ '^/[A-Za-z0-9]'),
  created_at timestamptz not null default now(),
  primary key (user_id, entity_type, entity_id)
);

alter table public.user_saved_items enable row level security;

create policy "Users read own saved items"
  on public.user_saved_items for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own saved items"
  on public.user_saved_items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users delete own saved items"
  on public.user_saved_items for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on public.user_saved_items to authenticated;

create table if not exists public.user_recent_views (
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('news', 'wiki', 'pointstack', 'library', 'course')),
  entity_id text not null,
  title text not null check (char_length(title) between 1 and 240),
  href text not null check (href ~ '^/[A-Za-z0-9]'),
  last_viewed_at timestamptz not null default now(),
  primary key (user_id, entity_type, entity_id)
);

alter table public.user_recent_views enable row level security;

create policy "Users read own recent views"
  on public.user_recent_views for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own recent views"
  on public.user_recent_views for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own recent views"
  on public.user_recent_views for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own recent views"
  on public.user_recent_views for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_recent_views to authenticated;

-- The existing Resource contract includes tags; add the missing authoritative column.
alter table public.pointstack_resource_listings
  add column if not exists tags text[] not null default '{}';

-- Allow the existing admin role to moderate the non-Atlas replacement surfaces.
create policy "Admins view all resources"
  on public.pointstack_resource_listings for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Admins update resources"
  on public.pointstack_resource_listings for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

create policy "Admins verify companies"
  on public.pointstack_companies for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
  );

-- Create or reuse a direct two-person conversation atomically.
create or replace function public.start_pointstack_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  conversation_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if other_user_id is null or other_user_id = current_user_id then
    raise exception 'Choose another PointStack member';
  end if;

  if not exists (select 1 from public.profiles where id = other_user_id) then
    raise exception 'PointStack member not found';
  end if;

  select c.id
    into conversation_id
    from public.pointstack_conversations c
   where exists (
     select 1 from public.pointstack_conversation_participants cp
      where cp.conversation_id = c.id and cp.user_id = current_user_id
   )
     and exists (
       select 1 from public.pointstack_conversation_participants cp
        where cp.conversation_id = c.id and cp.user_id = other_user_id
     )
     and (
       select count(*)
         from public.pointstack_conversation_participants cp
        where cp.conversation_id = c.id
     ) = 2
   order by c.updated_at desc
   limit 1;

  if conversation_id is null then
    insert into public.pointstack_conversations default values
    returning id into conversation_id;

    insert into public.pointstack_conversation_participants (conversation_id, user_id, last_read_at)
    values
      (conversation_id, current_user_id, now()),
      (conversation_id, other_user_id, null);
  end if;

  return conversation_id;
end;
$$;

revoke all on function public.start_pointstack_conversation(uuid) from public, anon;
grant execute on function public.start_pointstack_conversation(uuid) to authenticated;

-- Trigger functions are internal implementation details, not public RPC endpoints.
revoke all on function public.apply_endorsement_score_delta() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.pointstack_update_comment_upvote_count() from public, anon, authenticated;
revoke all on function public.pointstack_update_conversation_timestamp() from public, anon, authenticated;
revoke all on function public.pointstack_update_post_comment_count() from public, anon, authenticated;
revoke all on function public.pointstack_update_post_upvote_count() from public, anon, authenticated;
revoke all on function public.pointstack_update_project_like_count() from public, anon, authenticated;
revoke all on function public.pointstack_update_timestamp() from public, anon, authenticated;
revoke all on function public.pointstack_update_user_post_count() from public, anon, authenticated;
revoke all on function public.pointstack_update_user_reputation() from public, anon, authenticated;
revoke all on function public.prevent_self_admin_elevation() from public, anon, authenticated;
revoke all on function public.rate_limit_babel_contributions() from public, anon, authenticated;
revoke all on function public.rate_limit_equipment_submissions() from public, anon, authenticated;
revoke all on function public.rate_limit_wiki_contributions() from public, anon, authenticated;
revoke all on function public.sync_entitlements_with_tier() from public, anon, authenticated;
revoke all on function public.update_babel_contribution_updated_at() from public, anon, authenticated;
revoke all on function public.update_category_article_count() from public, anon, authenticated;
revoke all on function public.update_equipment_note_upvotes() from public, anon, authenticated;
revoke all on function public.update_equipment_notes_updated_at() from public, anon, authenticated;
revoke all on function public.update_equipment_submissions_updated_at() from public, anon, authenticated;
revoke all on function public.update_facet_article_count() from public, anon, authenticated;
revoke all on function public.update_news_article_comment_count() from public, anon, authenticated;
revoke all on function public.update_news_article_vote_count() from public, anon, authenticated;
revoke all on function public.update_news_comment_vote_count() from public, anon, authenticated;
revoke all on function public.update_resource_comment_count() from public, anon, authenticated;
revoke all on function public.update_resource_upvote_count() from public, anon, authenticated;
revoke all on function public.update_tag_article_count() from public, anon, authenticated;
revoke all on function public.update_updated_at_column() from public, anon, authenticated;
revoke all on function public.update_wiki_collection_updated_at() from public, anon, authenticated;
revoke all on function public.wiki_articles_search_trigger() from public, anon, authenticated;

-- Public buckets serve object URLs without broad storage.objects listing policies.
drop policy if exists "Public read access for avatars" on storage.objects;
drop policy if exists "Anyone can view equipment images" on storage.objects;
drop policy if exists "Public read access for forum images" on storage.objects;
drop policy if exists "Anyone can view pointstack images" on storage.objects;
drop policy if exists "Anyone can view pointstack post files" on storage.objects;
drop policy if exists "Public can view logos" on storage.objects;
