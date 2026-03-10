-- Drop legacy wiki tag tables now that facets are in place
-- Tag pages redirect to facet pages via the app layer

-- Drop the junction table first (references both)
DROP TABLE IF EXISTS wiki_article_tags;

-- Drop the tags table
DROP TABLE IF EXISTS wiki_tags;
