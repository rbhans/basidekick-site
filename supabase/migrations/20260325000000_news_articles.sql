-- News Article Aggregator Schema Migration
-- ============================================================
-- HackerNews-style news section for BAS industry articles.
-- Includes: articles, votes, comments, comment votes.
-- AI-curated articles are inserted via service role key
-- (bypasses RLS). Users can also submit articles directly.
-- ============================================================

-- ============================================================
-- NEWS ARTICLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  source_domain TEXT NOT NULL,
  summary TEXT,
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_ai_submitted BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  upvote_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Published articles are viewable by everyone"
  ON public.news_articles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can submit articles"
  ON public.news_articles FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can update articles"
  ON public.news_articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete articles"
  ON public.news_articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON public.news_articles (slug);
CREATE INDEX IF NOT EXISTS idx_news_articles_created ON public.news_articles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_upvotes ON public.news_articles (upvote_count DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_tags ON public.news_articles USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_news_articles_source ON public.news_articles (source_domain);
CREATE INDEX IF NOT EXISTS idx_news_articles_submitted_by ON public.news_articles (submitted_by);

-- ============================================================
-- NEWS ARTICLE VOTES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.news_article_votes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE NOT NULL,
  vote_type INT NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, article_id)
);

-- Enable RLS
ALTER TABLE public.news_article_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Article votes are viewable by everyone"
  ON public.news_article_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on articles"
  ON public.news_article_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their article votes"
  ON public.news_article_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their article votes"
  ON public.news_article_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_article_votes_article ON public.news_article_votes (article_id);

-- ============================================================
-- NEWS ARTICLE COMMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.news_article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.news_article_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvote_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_article_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Article comments are viewable by everyone"
  ON public.news_article_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create article comments"
  ON public.news_article_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their article comments"
  ON public.news_article_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their article comments"
  ON public.news_article_comments FOR DELETE
  USING (auth.uid() = author_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_article_comments_article ON public.news_article_comments (article_id);
CREATE INDEX IF NOT EXISTS idx_news_article_comments_author ON public.news_article_comments (author_id);
CREATE INDEX IF NOT EXISTS idx_news_article_comments_parent ON public.news_article_comments (parent_id);

-- ============================================================
-- NEWS ARTICLE COMMENT VOTES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.news_article_comment_votes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.news_article_comments(id) ON DELETE CASCADE NOT NULL,
  vote_type INT NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

-- Enable RLS
ALTER TABLE public.news_article_comment_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Article comment votes are viewable by everyone"
  ON public.news_article_comment_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote on article comments"
  ON public.news_article_comment_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their article comment votes"
  ON public.news_article_comment_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their article comment votes"
  ON public.news_article_comment_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_article_comment_votes_comment ON public.news_article_comment_votes (comment_id);

-- ============================================================
-- TRIGGER FUNCTIONS FOR DENORMALIZED COUNTS
-- ============================================================

-- Article vote count trigger
CREATE OR REPLACE FUNCTION public.update_news_article_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.news_articles
    SET upvote_count = upvote_count + NEW.vote_type
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.news_articles
    SET upvote_count = upvote_count - OLD.vote_type
    WHERE id = OLD.article_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.news_articles
    SET upvote_count = upvote_count - OLD.vote_type + NEW.vote_type
    WHERE id = NEW.article_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_news_article_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON public.news_article_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_news_article_vote_count();

-- Article comment count trigger
CREATE OR REPLACE FUNCTION public.update_news_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.news_articles
    SET comment_count = comment_count + 1
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.news_articles
    SET comment_count = GREATEST(0, comment_count - 1)
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_news_article_comment_count
  AFTER INSERT OR DELETE ON public.news_article_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_news_article_comment_count();

-- Comment vote count trigger
CREATE OR REPLACE FUNCTION public.update_news_comment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.news_article_comments
    SET upvote_count = upvote_count + NEW.vote_type
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.news_article_comments
    SET upvote_count = upvote_count - OLD.vote_type
    WHERE id = OLD.comment_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.news_article_comments
    SET upvote_count = upvote_count - OLD.vote_type + NEW.vote_type
    WHERE id = NEW.comment_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_news_comment_vote_count
  AFTER INSERT OR UPDATE OR DELETE ON public.news_article_comment_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_news_comment_vote_count();

-- Updated_at trigger for news_articles
CREATE TRIGGER set_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger for news_article_comments
CREATE TRIGGER set_news_article_comments_updated_at
  BEFORE UPDATE ON public.news_article_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
