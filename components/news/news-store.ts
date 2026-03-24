import { create } from "zustand";
import { toast } from "sonner";
import {
  NewsArticle,
  NewsArticleComment,
  NewsFeedFilter,
  CreateNewsCommentInput,
} from "@/lib/types";
import * as api from "./news-api";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

interface NewsState {
  // Feed state
  articles: NewsArticle[];
  feedFilter: NewsFeedFilter;
  feedLoading: boolean;
  feedError: string | null;
  hasMore: boolean;

  // Article detail
  currentArticle: NewsArticle | null;
  currentArticleComments: NewsArticleComment[];
  currentArticleLoading: boolean;

  // Feed actions
  fetchFeed: (filter?: NewsFeedFilter, reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  setFeedFilter: (filter: NewsFeedFilter) => void;
  voteArticle: (articleId: string, voteType: 1 | -1) => Promise<void>;
  submitArticle: (url: string, title: string, tags?: string[]) => Promise<NewsArticle>;

  // Article detail actions
  fetchArticleBySlug: (slug: string) => Promise<void>;
  fetchComments: (articleId: string) => Promise<void>;
  createComment: (input: CreateNewsCommentInput) => Promise<NewsArticleComment>;
  deleteComment: (commentId: string) => Promise<void>;
  voteComment: (commentId: string, voteType: 1 | -1) => Promise<void>;
  clearCurrentArticle: () => void;

  // Reset
  reset: () => void;
}

const ARTICLES_PER_PAGE = 30;

export const useNewsStore = create<NewsState>((set, get) => ({
  // Initial state
  articles: [],
  feedFilter: {},
  feedLoading: false,
  feedError: null,
  hasMore: true,

  currentArticle: null,
  currentArticleComments: [],
  currentArticleLoading: false,

  // Feed actions
  fetchFeed: async (filter, reset = true) => {
    const state = get();
    const effectiveFilter = filter ?? state.feedFilter;

    set({ feedLoading: true, feedError: null });

    try {
      const articles = await api.fetchArticles(effectiveFilter, ARTICLES_PER_PAGE, 0);
      set({
        articles,
        feedFilter: effectiveFilter,
        feedLoading: false,
        hasMore: articles.length === ARTICLES_PER_PAGE,
      });
    } catch (error) {
      console.error("Error fetching news feed:", error);
      set({ feedLoading: false, feedError: getErrorMessage(error) });
    }
  },

  loadMore: async () => {
    const { feedLoading, hasMore, feedFilter, articles: currentArticles } = get();
    if (feedLoading || !hasMore) return;

    set({ feedLoading: true });

    try {
      const newArticles = await api.fetchArticles(feedFilter, ARTICLES_PER_PAGE, currentArticles.length);
      set((state) => ({
        articles: [...state.articles, ...newArticles],
        feedLoading: false,
        hasMore: newArticles.length === ARTICLES_PER_PAGE,
      }));
    } catch (error) {
      console.error("Error loading more articles:", error);
      set({ feedLoading: false });
    }
  },

  setFeedFilter: (filter) => {
    set({ feedFilter: filter });
    get().fetchFeed(filter);
  },

  voteArticle: async (articleId, voteType) => {
    try {
      await api.voteArticle(articleId, voteType);
      // Optimistic update
      set((state) => ({
        articles: state.articles.map((a) =>
          a.id === articleId
            ? {
                ...a,
                upvote_count:
                  a.user_vote === voteType
                    ? a.upvote_count - voteType
                    : a.user_vote
                    ? a.upvote_count - a.user_vote + voteType
                    : a.upvote_count + voteType,
                user_vote: a.user_vote === voteType ? null : voteType,
              }
            : a
        ),
        currentArticle:
          state.currentArticle?.id === articleId
            ? {
                ...state.currentArticle,
                upvote_count:
                  state.currentArticle.user_vote === voteType
                    ? state.currentArticle.upvote_count - voteType
                    : state.currentArticle.user_vote
                    ? state.currentArticle.upvote_count - state.currentArticle.user_vote + voteType
                    : state.currentArticle.upvote_count + voteType,
                user_vote: state.currentArticle.user_vote === voteType ? null : voteType,
              }
            : state.currentArticle,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  submitArticle: async (url, title, tags) => {
    try {
      const article = await api.submitArticle(url, title, tags);
      set((state) => ({ articles: [article, ...state.articles] }));
      return article;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  // Article detail actions
  fetchArticleBySlug: async (slug) => {
    set({ currentArticleLoading: true });
    try {
      const article = await api.fetchArticleBySlug(slug);
      set({ currentArticle: article, currentArticleLoading: false });
      if (article) {
        get().fetchComments(article.id);
        api.incrementArticleViewCount(article.id).catch(() => {});
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      set({ currentArticleLoading: false });
    }
  },

  fetchComments: async (articleId) => {
    try {
      const comments = await api.fetchComments(articleId);
      set({ currentArticleComments: comments });
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  },

  createComment: async (input) => {
    const comment = await api.createComment(input);
    set((state) => ({
      currentArticleComments: [...state.currentArticleComments, comment],
      currentArticle: state.currentArticle
        ? { ...state.currentArticle, comment_count: state.currentArticle.comment_count + 1 }
        : null,
    }));
    return comment;
  },

  deleteComment: async (commentId) => {
    try {
      await api.deleteComment(commentId);
      set((state) => ({
        currentArticleComments: state.currentArticleComments.filter((c) => c.id !== commentId),
        currentArticle: state.currentArticle
          ? { ...state.currentArticle, comment_count: Math.max(0, state.currentArticle.comment_count - 1) }
          : null,
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  },

  voteComment: async (commentId, voteType) => {
    try {
      await api.voteComment(commentId, voteType);
      set((state) => ({
        currentArticleComments: state.currentArticleComments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                upvote_count:
                  c.user_vote === voteType
                    ? c.upvote_count - voteType
                    : c.user_vote
                    ? c.upvote_count - c.user_vote + voteType
                    : c.upvote_count + voteType,
                user_vote: c.user_vote === voteType ? null : voteType,
              }
            : c
        ),
      }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  clearCurrentArticle: () => {
    set({ currentArticle: null, currentArticleComments: [] });
  },

  // Reset
  reset: () => {
    set({
      articles: [],
      feedFilter: {},
      feedLoading: false,
      feedError: null,
      hasMore: true,
      currentArticle: null,
      currentArticleComments: [],
      currentArticleLoading: false,
    });
  },
}));
