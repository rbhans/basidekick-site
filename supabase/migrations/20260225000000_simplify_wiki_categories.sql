-- Simplify wiki categories: flatten subcategories into parents, rename BASidekick Documentation → Documentation

-- 1. Reassign all articles from subcategories to their parent category
UPDATE wiki_articles
SET category_id = sub.parent_id
FROM wiki_categories sub
WHERE wiki_articles.category_id = sub.id
  AND sub.parent_id IS NOT NULL;

-- 2. Rename "BASidekick Documentation" → "Documentation"
UPDATE wiki_categories
SET name = 'Documentation',
    slug = 'documentation'
WHERE slug = 'basidekick-docs';

-- 3. Delete all subcategory rows
DELETE FROM wiki_categories
WHERE parent_id IS NOT NULL;
