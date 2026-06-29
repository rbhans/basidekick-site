-- Per-user profile cover banner: an uploaded image and/or a background color.
-- Both nullable; when both are null the profile falls back to the default dark banner.
-- Covered by the existing "users update own profile" RLS policy.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS cover_color text;
