-- Wiki Facets & Collections Migration
-- Phase 1: Add facet system, collections, rename/add categories

-- ============================================================
-- 1a. Category updates: rename, add, set colors
-- ============================================================

-- Add color column to wiki_categories
ALTER TABLE wiki_categories ADD COLUMN IF NOT EXISTS color TEXT;

-- Rename "Issues & Solutions" → "Troubleshooting"
UPDATE wiki_categories
SET name = 'Troubleshooting',
    slug = 'troubleshooting',
    color = '#F59E0B',
    display_order = 1
WHERE slug = 'issues-solutions';

-- Rename "How-To Guides" → "How-To"
UPDATE wiki_categories
SET name = 'How-To',
    slug = 'how-to',
    color = '#3B82F6',
    display_order = 2
WHERE slug = 'how-to-guides';

-- Update "Best Practices" color and order
UPDATE wiki_categories
SET color = '#10B981',
    display_order = 3
WHERE slug = 'best-practices';

-- Update "Documentation" color and order
UPDATE wiki_categories
SET color = '#8B5CF6',
    display_order = 4
WHERE slug IN ('documentation', 'basidekick-docs');

-- Add "Reference" category if it doesn't exist
INSERT INTO wiki_categories (name, slug, description, icon_name, display_order, color)
SELECT 'Reference', 'reference', 'Technical references, specifications, and lookup tables', 'Book', 5, '#06B6D4'
WHERE NOT EXISTS (SELECT 1 FROM wiki_categories WHERE slug = 'reference');

-- ============================================================
-- 1b. Create facet tables
-- ============================================================

-- Facet groups (platform_vendor, protocol, system_domain, topic, content_format)
CREATE TABLE IF NOT EXISTS wiki_facet_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual facets within groups
CREATE TABLE IF NOT EXISTS wiki_facets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES wiki_facet_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  article_count INT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_wiki_facets_group_id ON wiki_facets(group_id);

-- Article-facet junction table
CREATE TABLE IF NOT EXISTS wiki_article_facets (
  article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
  facet_id UUID NOT NULL REFERENCES wiki_facets(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, facet_id)
);

CREATE INDEX IF NOT EXISTS idx_wiki_article_facets_facet_id ON wiki_article_facets(facet_id);
CREATE INDEX IF NOT EXISTS idx_wiki_article_facets_article_id ON wiki_article_facets(article_id);

-- ============================================================
-- 1c. Create collection tables
-- ============================================================

CREATE TABLE IF NOT EXISTS wiki_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_icon TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wiki_collection_articles (
  collection_id UUID NOT NULL REFERENCES wiki_collections(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, article_id)
);

-- Trigger for updated_at on collections
CREATE OR REPLACE FUNCTION update_wiki_collection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wiki_collections_updated_at ON wiki_collections;
CREATE TRIGGER wiki_collections_updated_at
  BEFORE UPDATE ON wiki_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_wiki_collection_updated_at();

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE wiki_facet_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_facets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_article_facets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wiki_collection_articles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view facet groups" ON wiki_facet_groups FOR SELECT USING (true);
CREATE POLICY "Public can view facets" ON wiki_facets FOR SELECT USING (true);
CREATE POLICY "Public can view article facets" ON wiki_article_facets FOR SELECT USING (true);
CREATE POLICY "Public can view collections" ON wiki_collections FOR SELECT USING (true);
CREATE POLICY "Public can view collection articles" ON wiki_collection_articles FOR SELECT USING (true);

-- Admin write access (matching existing profiles.role = 'admin' pattern)
CREATE POLICY "Admins can manage facet groups" ON wiki_facet_groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can manage facets" ON wiki_facets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can manage article facets" ON wiki_article_facets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can manage collections" ON wiki_collections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can manage collection articles" ON wiki_collection_articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================================
-- Trigger: update facet article_count
-- ============================================================

CREATE OR REPLACE FUNCTION update_facet_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wiki_facets SET article_count = article_count + 1 WHERE id = NEW.facet_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wiki_facets SET article_count = article_count - 1 WHERE id = OLD.facet_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wiki_article_facets_count ON wiki_article_facets;
CREATE TRIGGER wiki_article_facets_count
  AFTER INSERT OR DELETE ON wiki_article_facets
  FOR EACH ROW
  EXECUTE FUNCTION update_facet_article_count();

-- ============================================================
-- 1d. Seed facet groups
-- ============================================================

INSERT INTO wiki_facet_groups (name, slug, display_order) VALUES
  ('Platform / Vendor', 'platform_vendor', 1),
  ('Protocol', 'protocol', 2),
  ('System Domain', 'system_domain', 3),
  ('Topic', 'topic', 4),
  ('Content Format', 'content_format', 5)
ON CONFLICT (slug) DO NOTHING;

-- Seed facets from existing tags
-- Platform / Vendor
INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, t.name, t.slug, row_number() OVER (ORDER BY t.name)
FROM wiki_tags t
CROSS JOIN wiki_facet_groups g
WHERE g.slug = 'platform_vendor'
  AND t.slug IN ('niagara', 'metasys')
ON CONFLICT (group_id, slug) DO NOTHING;

-- Protocol
INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, t.name, t.slug, row_number() OVER (ORDER BY t.name)
FROM wiki_tags t
CROSS JOIN wiki_facet_groups g
WHERE g.slug = 'protocol'
  AND t.slug IN ('bacnet', 'bacnet-sc', 'mstp', 'mqtt', 'sparkplug-b', 'foxs', 'haystack', 'brick')
ON CONFLICT (group_id, slug) DO NOTHING;

-- System Domain
INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, t.name, t.slug, row_number() OVER (ORDER BY t.name)
FROM wiki_tags t
CROSS JOIN wiki_facet_groups g
WHERE g.slug = 'system_domain'
  AND t.slug IN ('networking', 'security', 'performance', 'graphics', 'encryption', 'tls')
ON CONFLICT (group_id, slug) DO NOTHING;

-- Topic
INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, t.name, t.slug, row_number() OVER (ORDER BY t.name)
FROM wiki_tags t
CROSS JOIN wiki_facet_groups g
WHERE g.slug = 'topic'
  AND t.slug IN (
    'troubleshooting', 'commissioning', 'authentication', 'database', 'px',
    'digital-twin', 'analytics', 'iot', 'virtualization', 'data-modeling',
    'integration', 'semantic-modeling', 'tagging', 'user-management',
    'access-control', 'permissions', 'sensors', 'backup', 'bbmd',
    'certificate', 'sct'
  )
ON CONFLICT (group_id, slug) DO NOTHING;

-- Content Format
INSERT INTO wiki_facets (group_id, name, slug, display_order)
SELECT g.id, v.name, v.slug, v.ord
FROM wiki_facet_groups g
CROSS JOIN (VALUES
  ('Checklist', 'checklist', 1),
  ('Error Codes', 'error-codes', 2),
  ('Guide', 'guide', 3),
  ('Reference', 'reference', 4),
  ('Procedure', 'procedure', 5)
) AS v(name, slug, ord)
WHERE g.slug = 'content_format'
ON CONFLICT (group_id, slug) DO NOTHING;

-- ============================================================
-- Migrate article-tag relationships to article-facet
-- ============================================================

INSERT INTO wiki_article_facets (article_id, facet_id)
SELECT DISTINCT at.article_id, f.id
FROM wiki_article_tags at
JOIN wiki_tags t ON t.id = at.tag_id
JOIN wiki_facets f ON f.slug = t.slug
ON CONFLICT DO NOTHING;

-- Update facet article_count from actual data (correct any trigger misses during bulk insert)
UPDATE wiki_facets f
SET article_count = COALESCE(counts.cnt, 0)
FROM (
  SELECT facet_id, COUNT(*) as cnt
  FROM wiki_article_facets
  GROUP BY facet_id
) counts
WHERE f.id = counts.facet_id;

-- Zero out any facets with no articles
UPDATE wiki_facets SET article_count = 0
WHERE id NOT IN (SELECT DISTINCT facet_id FROM wiki_article_facets);

-- ============================================================
-- 1e. Seed starter collections
-- ============================================================

-- Getting Started with Niagara
INSERT INTO wiki_collections (name, slug, description, cover_icon, is_featured, display_order)
VALUES (
  'Getting Started with Niagara',
  'getting-started-niagara',
  'Essential articles for Niagara framework newcomers — from setup to daily operations.',
  'Compass',
  true,
  1
) ON CONFLICT (slug) DO NOTHING;

-- BACnet Field Guide
INSERT INTO wiki_collections (name, slug, description, cover_icon, is_featured, display_order)
VALUES (
  'BACnet Field Guide',
  'bacnet-field-guide',
  'Everything you need to know about BACnet networking, troubleshooting, and best practices.',
  'WifiHigh',
  true,
  2
) ON CONFLICT (slug) DO NOTHING;

-- Security Hardening
INSERT INTO wiki_collections (name, slug, description, cover_icon, is_featured, display_order)
VALUES (
  'Security Hardening',
  'security-hardening',
  'Lock down your BAS — TLS configuration, certificate management, and access control.',
  'ShieldCheck',
  true,
  3
) ON CONFLICT (slug) DO NOTHING;

-- Metasys Administration
INSERT INTO wiki_collections (name, slug, description, cover_icon, is_featured, display_order)
VALUES (
  'Metasys Administration',
  'metasys-administration',
  'Administration guides and troubleshooting for Johnson Controls Metasys systems.',
  'GearSix',
  true,
  4
) ON CONFLICT (slug) DO NOTHING;

-- Populate collection articles from facets
-- Getting Started with Niagara
INSERT INTO wiki_collection_articles (collection_id, article_id, display_order)
SELECT c.id, af.article_id, row_number() OVER (ORDER BY a.created_at)
FROM wiki_collections c
JOIN wiki_facets f ON f.slug = 'niagara'
JOIN wiki_article_facets af ON af.facet_id = f.id
JOIN wiki_articles a ON a.id = af.article_id AND a.is_published = true
WHERE c.slug = 'getting-started-niagara'
ON CONFLICT DO NOTHING;

-- BACnet Field Guide
INSERT INTO wiki_collection_articles (collection_id, article_id, display_order)
SELECT c.id, af.article_id, row_number() OVER (ORDER BY a.created_at)
FROM wiki_collections c
JOIN wiki_facets f ON f.slug = 'bacnet'
JOIN wiki_article_facets af ON af.facet_id = f.id
JOIN wiki_articles a ON a.id = af.article_id AND a.is_published = true
WHERE c.slug = 'bacnet-field-guide'
ON CONFLICT DO NOTHING;

-- Security Hardening (security + encryption + tls facets)
INSERT INTO wiki_collection_articles (collection_id, article_id, display_order)
SELECT c.id, af.article_id, row_number() OVER (ORDER BY a.created_at)
FROM wiki_collections c
JOIN wiki_facets f ON f.slug IN ('security', 'encryption', 'tls')
JOIN wiki_article_facets af ON af.facet_id = f.id
JOIN wiki_articles a ON a.id = af.article_id AND a.is_published = true
WHERE c.slug = 'security-hardening'
ON CONFLICT DO NOTHING;

-- Metasys Administration
INSERT INTO wiki_collection_articles (collection_id, article_id, display_order)
SELECT c.id, af.article_id, row_number() OVER (ORDER BY a.created_at)
FROM wiki_collections c
JOIN wiki_facets f ON f.slug = 'metasys'
JOIN wiki_article_facets af ON af.facet_id = f.id
JOIN wiki_articles a ON a.id = af.article_id AND a.is_published = true
WHERE c.slug = 'metasys-administration'
ON CONFLICT DO NOTHING;
