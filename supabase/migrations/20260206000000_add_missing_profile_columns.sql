-- Add missing columns to profiles table that are defined in schema.sql
-- but were never added to the remote database.
-- These columns are referenced throughout the codebase (avatar_url alone
-- is used in ~30 queries).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
