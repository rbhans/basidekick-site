-- Simplify wiki categories: convert subcategories to tags, flatten to 4 parent categories,
-- and auto-tag all articles by title patterns.

-- ============================================================
-- STEP 1: Create all new tags
-- ============================================================

-- Subcategory-derived tags (niagara/metasys already exist)
INSERT INTO wiki_tags (name, slug) VALUES
  ('general-bas', 'general-bas'),
  ('niagarasidekick', 'niagarasidekick'),
  ('simulatorsidekick', 'simulatorsidekick'),
  ('metasyssidekick', 'metasyssidekick'),
  ('projectsidekick', 'projectsidekick')
ON CONFLICT (slug) DO NOTHING;

-- Vendor tags
INSERT INTO wiki_tags (name, slug) VALUES
  ('honeywell', 'honeywell'),
  ('siemens', 'siemens'),
  ('carrier', 'carrier'),
  ('trane', 'trane'),
  ('distech', 'distech'),
  ('alerton', 'alerton'),
  ('schneider', 'schneider')
ON CONFLICT (slug) DO NOTHING;

-- Protocol/technology tags
INSERT INTO wiki_tags (name, slug) VALUES
  ('modbus', 'modbus'),
  ('lonworks', 'lonworks')
ON CONFLICT (slug) DO NOTHING;

-- Topic tags
INSERT INTO wiki_tags (name, slug) VALUES
  ('hvac', 'hvac'),
  ('alarms', 'alarms')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 2: Tag articles from subcategory → platform tag
-- ============================================================

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT a.id, t.id
FROM wiki_articles a
JOIN wiki_categories sub ON a.category_id = sub.id
JOIN wiki_tags t ON t.slug = CASE sub.slug
  WHEN 'issues-solutions-niagara'  THEN 'niagara'
  WHEN 'issues-solutions-metasys'  THEN 'metasys'
  WHEN 'issues-solutions-general'  THEN 'general-bas'
  WHEN 'how-to-niagara'            THEN 'niagara'
  WHEN 'how-to-metasys'            THEN 'metasys'
  WHEN 'how-to-general'            THEN 'general-bas'
  WHEN 'best-practices-niagara'    THEN 'niagara'
  WHEN 'best-practices-metasys'    THEN 'metasys'
  WHEN 'best-practices-general'    THEN 'general-bas'
  WHEN 'docs-niagarasidekick'      THEN 'niagarasidekick'
  WHEN 'docs-simulatorsidekick'    THEN 'simulatorsidekick'
  WHEN 'docs-metasyssidekick'      THEN 'metasyssidekick'
  WHEN 'docs-projectsidekick'      THEN 'projectsidekick'
END
WHERE sub.parent_id IS NOT NULL
ON CONFLICT (article_id, tag_id) DO NOTHING;

-- ============================================================
-- STEP 3: Tag all Issues & Solutions articles as troubleshooting
--         (must run while subcategories still exist)
-- ============================================================

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT a.id, t.id
FROM wiki_articles a
JOIN wiki_categories c ON a.category_id = c.id
CROSS JOIN wiki_tags t
WHERE t.slug = 'troubleshooting'
  AND c.slug LIKE 'issues-solutions-%'
ON CONFLICT (article_id, tag_id) DO NOTHING;

-- ============================================================
-- STEP 4: Auto-tag articles by title patterns
-- ============================================================

INSERT INTO wiki_article_tags (article_id, tag_id)
SELECT DISTINCT a.id, t.id
FROM wiki_articles a
CROSS JOIN wiki_tags t
WHERE
  -- ---- Vendor tags ----
  (t.slug = 'honeywell' AND a.title ~* '\m(honeywell|webs-n4)\M')
  OR (t.slug = 'siemens' AND a.title ~* '\msiemens\M')
  OR (t.slug = 'carrier' AND a.title ~* '\m(carrier|i-vu|systemvu)\M')
  OR (t.slug = 'trane' AND a.title ~* '\mtrane\M')
  OR (t.slug = 'distech' AND a.title ~* '(distech|ecy-apex|envysion)')
  OR (t.slug = 'alerton' AND a.title ~* '(alerton|bactalk)')
  OR (t.slug = 'schneider' AND a.title ~* '\m(schneider|ebo)\M')

  -- ---- Cross-platform references (general articles mentioning specific platforms) ----
  OR (t.slug = 'niagara' AND a.title ~* '\mniagara\M')
  OR (t.slug = 'metasys' AND a.title ~* '\mmetasys\M')

  -- ---- Protocol tags ----
  OR (t.slug = 'bacnet' AND a.title ~* '(bacnet|bbmd)')
  OR (t.slug = 'mstp' AND a.title ~* '(ms/tp|mstp)')
  OR (t.slug = 'modbus' AND a.title ~* '\mmodbus\M')
  OR (t.slug = 'lonworks' AND a.title ~* '\mlonworks\M')
  OR (t.slug = 'mqtt' AND a.title ~* '\mmqtt\M')
  OR (t.slug = 'sparkplug-b' AND a.title ~* 'sparkplug')

  -- ---- Topic tags ----
  OR (t.slug = 'hvac' AND a.title ~* '(hvac|ahu|vav|\mboiler|chiller|economizer|ventilation|heat pump|fan coil|hydronic)')
  OR (t.slug = 'graphics' AND a.title ~* '(graphic|dashboard|widget|\msvg\M)')
  OR (t.slug = 'px' AND a.title ~* '(\mpx\M|reportpx)')
  OR (t.slug = 'alarms' AND a.title ~* '(\malarm|fire event)')
  OR (t.slug = 'security' AND a.title ~* '(security|cybersecurity|hardening|vulnerabilit|password|credential|unauthorized access|cyber health)')
  OR (t.slug = 'tls' AND a.title ~* '\mtls\M')
  OR (t.slug = 'certificate' AND a.title ~* '\mcertificate')
  OR (t.slug = 'authentication' AND a.title ~* '(ldap|authentication)')
  OR (t.slug = 'networking' AND a.title ~* '(network|vlan|ethernet|firewall|\mports?\M|ip across)')
  OR (t.slug = 'commissioning' AND a.title ~* '(commissioning|checkout)')
  OR (t.slug = 'troubleshooting' AND a.title ~* '(troubleshoot|diagnos)')
  OR (t.slug = 'sensors' AND a.title ~* '(sensor|4.20\s*ma|0.10\s*v|\mrtd\M|motion detector)')
  OR (t.slug = 'backup' AND a.title ~* '(backup|restore|recovery|archive)')
  OR (t.slug = 'database' AND a.title ~* '(database|sql server)')
  OR (t.slug = 'performance' AND a.title ~* '(performance|optimiz|memory|cpu|heap|slow)')
  OR (t.slug = 'integration' AND a.title ~* '(integrat|migrat|gateway|protocol conversion|legacy system)')
  OR (t.slug = 'iot' AND a.title ~* '(\miot\M|edge.to.cloud)')
  OR (t.slug = 'analytics' AND a.title ~* '(analytics|diagnostics|trend log|predictive|digital twin)')
  OR (t.slug = 'user-management' AND a.title ~* '(user role|user management|creating new (users|roles))')
  OR (t.slug = 'tagging' AND a.title ~* '(tagging|tag.based|naming convention|point naming)')
  OR (t.slug = 'haystack' AND a.title ~* '\mhaystack\M')
  OR (t.slug = 'sct' AND a.title ~* '\msct\M')
  OR (t.slug = 'data-modeling' AND a.title ~* '(data mapping|point normalization|ontology)')
ON CONFLICT (article_id, tag_id) DO NOTHING;

-- ============================================================
-- STEP 5: Reassign all articles from subcategories to parent
-- ============================================================

UPDATE wiki_articles
SET category_id = sub.parent_id
FROM wiki_categories sub
WHERE wiki_articles.category_id = sub.id
  AND sub.parent_id IS NOT NULL;

-- ============================================================
-- STEP 6: Rename "BASidekick Documentation" → "Documentation"
-- ============================================================

UPDATE wiki_categories
SET name = 'Documentation',
    slug = 'documentation'
WHERE slug = 'basidekick-docs';

-- ============================================================
-- STEP 7: Delete all subcategory rows
-- ============================================================

DELETE FROM wiki_categories
WHERE parent_id IS NOT NULL;
