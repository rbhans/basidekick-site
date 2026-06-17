ALTER TABLE public.pointstack_resource_listings
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_pointstack_resources_tags
  ON public.pointstack_resource_listings USING GIN (tags);
