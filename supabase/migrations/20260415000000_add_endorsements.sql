-- ============================================================
-- PEER ENDORSEMENTS
-- Lets members endorse each other on a curated list of BAS
-- topics. Flat scoring (1 endorsement = 1 point). Display-only
-- tiers derived in application code.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Curated topic list
-- ------------------------------------------------------------
CREATE TABLE public.endorsement_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  wiki_category_id UUID REFERENCES public.wiki_categories(id) ON DELETE SET NULL,
  icon_name TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.endorsement_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Endorsement topics are viewable by everyone"
  ON public.endorsement_topics FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert endorsement topics"
  ON public.endorsement_topics FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update endorsement topics"
  ON public.endorsement_topics FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete endorsement topics"
  ON public.endorsement_topics FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_endorsement_topics_active_order
  ON public.endorsement_topics (is_active, display_order);

-- ------------------------------------------------------------
-- 2. Endorsements (one per endorser / endorsee / topic)
-- ------------------------------------------------------------
CREATE TABLE public.endorsements (
  endorser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endorsee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id    UUID NOT NULL REFERENCES public.endorsement_topics(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (endorser_id, endorsee_id, topic_id),
  CHECK (endorser_id <> endorsee_id)
);

ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Endorsements are viewable by everyone"
  ON public.endorsements FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can endorse"
  ON public.endorsements FOR INSERT
  WITH CHECK (
    auth.uid() = endorser_id
    AND endorser_id <> endorsee_id
    AND EXISTS (
      SELECT 1 FROM public.endorsement_topics t
      WHERE t.id = topic_id AND t.is_active = true
    )
  );

CREATE POLICY "Endorsers can remove their endorsements"
  ON public.endorsements FOR DELETE
  USING (auth.uid() = endorser_id);

CREATE INDEX idx_endorsements_endorsee_topic
  ON public.endorsements (endorsee_id, topic_id);

CREATE INDEX idx_endorsements_endorser_created
  ON public.endorsements (endorser_id, created_at DESC);

-- ------------------------------------------------------------
-- 3. Denormalized score per (user, topic)
-- ------------------------------------------------------------
CREATE TABLE public.endorsement_scores (
  user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.endorsement_topics(id) ON DELETE CASCADE,
  score    INT NOT NULL DEFAULT 0 CHECK (score >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);

ALTER TABLE public.endorsement_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Endorsement scores are viewable by everyone"
  ON public.endorsement_scores FOR SELECT
  USING (true);

-- No direct writes; trigger-maintained only.

CREATE INDEX idx_endorsement_scores_topic_rank
  ON public.endorsement_scores (topic_id, score DESC);

-- ------------------------------------------------------------
-- 4. Trigger to keep endorsement_scores in sync
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_endorsement_score_delta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.endorsement_scores (user_id, topic_id, score, updated_at)
    VALUES (NEW.endorsee_id, NEW.topic_id, 1, now())
    ON CONFLICT (user_id, topic_id)
    DO UPDATE SET
      score = public.endorsement_scores.score + 1,
      updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.endorsement_scores
    SET score = GREATEST(score - 1, 0),
        updated_at = now()
    WHERE user_id = OLD.endorsee_id AND topic_id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_endorsements_score_delta
AFTER INSERT OR DELETE ON public.endorsements
FOR EACH ROW
EXECUTE FUNCTION public.apply_endorsement_score_delta();

-- ------------------------------------------------------------
-- 5. Seed initial topics (aligned with wiki_categories slugs where applicable)
-- ------------------------------------------------------------
INSERT INTO public.endorsement_topics (slug, name, description, wiki_category_id, display_order)
SELECT v.slug, v.name, v.description,
       (SELECT id FROM public.wiki_categories c WHERE c.slug = v.slug LIMIT 1),
       v.display_order
FROM (VALUES
  ('niagara',       'Niagara',                'Tridium Niagara framework & N4',           10),
  ('metasys',       'Metasys',                'Johnson Controls Metasys platform',        20),
  ('bacnet',        'BACnet',                 'BACnet protocol, routing, integration',    30),
  ('commissioning', 'Commissioning',          'System commissioning & acceptance',        40),
  ('wiring',        'Wiring',                 'Field wiring, terminations, diagnostics',  50),
  ('troubleshooting','Troubleshooting',       'Field troubleshooting & repair',           60),
  ('networking',    'Networking',             'BAS networking, IP, VLANs, switches',      70),
  ('security',      'Security',               'BAS cybersecurity & hardening',            80),
  ('performance',   'Performance',            'Tuning, trending, optimization',           90),
  ('haystack',      'Project Haystack',       'Haystack semantic tagging',               100),
  ('brick',         'Brick Schema',           'Brick semantic modeling',                 110)
) AS v(slug, name, description, display_order);
