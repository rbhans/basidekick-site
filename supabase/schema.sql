-- basidekick Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
-- Extends Supabase auth.users with app-specific data

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies: Users can read all profiles, update their own
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- LICENSES TABLE
-- ============================================================
-- For software purchases via Lemon Squeezy

create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  product_id text not null, -- 'nsk', 'ssk', 'msk'
  license_key text not null,
  lemon_squeezy_order_id text,
  purchased_at timestamptz default now(),
  expires_at timestamptz, -- null = lifetime
  is_active boolean default true
);

-- Enable RLS
alter table public.licenses enable row level security;

-- Policies: Users can only see their own licenses
create policy "Users can view their own licenses"
  on public.licenses for select
  using (auth.uid() = user_id);

-- ============================================================
-- WIKI TABLES
-- ============================================================

-- Wiki categories
create table public.wiki_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.wiki_categories enable row level security;

create policy "Wiki categories are viewable by everyone"
  on public.wiki_categories for select
  using (true);

-- Wiki pages
create table public.wiki_pages (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.wiki_categories(id) on delete set null,
  title text not null,
  slug text unique not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  upvotes int default 0,
  downvotes int default 0
);

-- Enable RLS
alter table public.wiki_pages enable row level security;

create policy "Wiki pages are viewable by everyone"
  on public.wiki_pages for select
  using (true);

create policy "Authenticated users can create wiki pages"
  on public.wiki_pages for insert
  with check (auth.uid() is not null);

create policy "Authors can update their wiki pages"
  on public.wiki_pages for update
  using (auth.uid() = author_id);

-- Wiki tags
create table public.wiki_tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

-- Enable RLS
alter table public.wiki_tags enable row level security;

create policy "Wiki tags are viewable by everyone"
  on public.wiki_tags for select
  using (true);

create policy "Authenticated users can create wiki tags"
  on public.wiki_tags for insert
  with check (auth.uid() is not null);

-- Wiki page tags (junction table)
create table public.wiki_page_tags (
  page_id uuid references public.wiki_pages(id) on delete cascade,
  tag_id uuid references public.wiki_tags(id) on delete cascade,
  primary key (page_id, tag_id)
);

-- Enable RLS
alter table public.wiki_page_tags enable row level security;

create policy "Wiki page tags are viewable by everyone"
  on public.wiki_page_tags for select
  using (true);

create policy "Authenticated users can manage page tags"
  on public.wiki_page_tags for all
  using (auth.uid() is not null);

-- Wiki comments
create table public.wiki_comments (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.wiki_pages(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.wiki_comments enable row level security;

create policy "Wiki comments are viewable by everyone"
  on public.wiki_comments for select
  using (true);

create policy "Authenticated users can create comments"
  on public.wiki_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.wiki_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.wiki_comments for delete
  using (auth.uid() = user_id);

-- Wiki votes
create table public.wiki_votes (
  user_id uuid references public.profiles(id) on delete cascade,
  page_id uuid references public.wiki_pages(id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)), -- -1 = downvote, 1 = upvote
  created_at timestamptz default now(),
  primary key (user_id, page_id)
);

-- Enable RLS
alter table public.wiki_votes enable row level security;

create policy "Users can view all votes"
  on public.wiki_votes for select
  using (true);

create policy "Authenticated users can vote"
  on public.wiki_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can change their vote"
  on public.wiki_votes for update
  using (auth.uid() = user_id);

create policy "Users can remove their vote"
  on public.wiki_votes for delete
  using (auth.uid() = user_id);

-- ============================================================
-- FORUM TABLES
-- ============================================================

-- Forum categories
create table public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text, -- icon name from phosphor
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.forum_categories enable row level security;

create policy "Forum categories are viewable by everyone"
  on public.forum_categories for select
  using (true);

-- Forum threads
create table public.forum_threads (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.forum_categories(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null,
  is_pinned boolean default false,
  is_locked boolean default false,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_post_at timestamptz default now()
);

-- Enable RLS
alter table public.forum_threads enable row level security;

create policy "Forum threads are viewable by everyone"
  on public.forum_threads for select
  using (true);

create policy "Authenticated users can create threads"
  on public.forum_threads for insert
  with check (auth.uid() is not null);

create policy "Authors can update their threads"
  on public.forum_threads for update
  using (auth.uid() = author_id);

-- Forum posts (replies)
create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.forum_threads(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  is_solution boolean default false, -- for Q&A style marking
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.forum_posts enable row level security;

create policy "Forum posts are viewable by everyone"
  on public.forum_posts for select
  using (true);

create policy "Authenticated users can create posts"
  on public.forum_posts for insert
  with check (auth.uid() is not null);

create policy "Authors can update their posts"
  on public.forum_posts for update
  using (auth.uid() = author_id);

-- ============================================================
-- PROJECTS TABLE (PSK)
-- ============================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  data jsonb default '{}', -- flexible project data storage
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies: Users can only CRUD their own projects
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to relevant tables
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_wiki_pages_updated_at
  before update on public.wiki_pages
  for each row execute function public.update_updated_at_column();

create trigger update_wiki_comments_updated_at
  before update on public.wiki_comments
  for each row execute function public.update_updated_at_column();

create trigger update_forum_threads_updated_at
  before update on public.forum_threads
  for each row execute function public.update_updated_at_column();

create trigger update_forum_posts_updated_at
  before update on public.forum_posts
  for each row execute function public.update_updated_at_column();

create trigger update_projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- INDEXES
-- ============================================================

-- Wiki indexes
create index wiki_pages_category_id_idx on public.wiki_pages(category_id);
create index wiki_pages_author_id_idx on public.wiki_pages(author_id);
create index wiki_pages_slug_idx on public.wiki_pages(slug);
create index wiki_comments_page_id_idx on public.wiki_comments(page_id);
create index wiki_votes_page_id_idx on public.wiki_votes(page_id);

-- Forum indexes
create index forum_threads_category_id_idx on public.forum_threads(category_id);
create index forum_threads_author_id_idx on public.forum_threads(author_id);
create index forum_posts_thread_id_idx on public.forum_posts(thread_id);
create index forum_posts_author_id_idx on public.forum_posts(author_id);

-- Projects index
create index projects_user_id_idx on public.projects(user_id);

-- Licenses index
create index licenses_user_id_idx on public.licenses(user_id);
