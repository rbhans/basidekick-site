"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";
import {
  Users,
  Article,
  Chats,
  ChartBar,
  PushPin,
  Lock,
  Eye,
  EyeSlash,
  Trash,
  Check,
  X,
  ShieldCheck,
  ShieldSlash,
  BookBookmark,
  ArrowSquareOut,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";

interface AdminUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  company: string | null;
  is_admin: boolean;
  post_count: number;
  created_at: string;
}

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  author: { display_name: string | null } | null;
  category: { name: string } | null;
}

interface AdminThread {
  id: string;
  title: string;
  slug: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number | null;
  created_at: string;
  author: { display_name: string | null } | null;
  category: { name: string; slug: string } | null;
}

interface AdminSuggestion {
  id: string;
  created_at: string;
  status: string;
  thread: {
    id: string;
    title: string;
    slug: string;
    category: { slug: string } | null;
  } | null;
  suggested_by: { display_name: string | null } | null;
}

interface AdminStats {
  userCount: number;
  articleCount: number;
  threadCount: number;
  postCount: number;
  pendingSuggestions: number;
}

interface AdminViewProps {
  users: AdminUser[];
  articles: AdminArticle[];
  threads: AdminThread[];
  suggestions: AdminSuggestion[];
  stats: AdminStats;
}

type TabId = "overview" | "users" | "wiki" | "forum" | "suggestions";

export function AdminView({
  users: initialUsers,
  articles: initialArticles,
  threads: initialThreads,
  suggestions: initialSuggestions,
  stats,
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [users, setUsers] = useState(initialUsers);
  const [articles, setArticles] = useState(initialArticles);
  const [threads, setThreads] = useState(initialThreads);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [loading, setLoading] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // User actions
  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    setLoading(`admin-${userId}`);
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !currentStatus })
      .eq("id", userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_admin: !currentStatus } : u))
      );
    }
    setLoading(null);
  };

  // Article actions
  const togglePublished = async (articleId: string, currentStatus: boolean) => {
    setLoading(`publish-${articleId}`);
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("wiki_articles")
      .update({ is_published: !currentStatus })
      .eq("id", articleId);

    if (!error) {
      setArticles((prev) =>
        prev.map((a) => (a.id === articleId ? { ...a, is_published: !currentStatus } : a))
      );
    }
    setLoading(null);
  };

  const deleteArticle = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    setLoading(`delete-article-${articleId}`);
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase.from("wiki_articles").delete().eq("id", articleId);

    if (!error) {
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    }
    setLoading(null);
  };

  // Thread actions
  const togglePinned = async (threadId: string, currentStatus: boolean) => {
    setLoading(`pin-${threadId}`);
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("forum_threads")
      .update({ is_pinned: !currentStatus })
      .eq("id", threadId);

    if (!error) {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, is_pinned: !currentStatus } : t))
      );
    }
    setLoading(null);
  };

  const toggleLocked = async (threadId: string, currentStatus: boolean) => {
    setLoading(`lock-${threadId}`);
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("forum_threads")
      .update({ is_locked: !currentStatus })
      .eq("id", threadId);

    if (!error) {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, is_locked: !currentStatus } : t))
      );
    }
    setLoading(null);
  };

  const deleteThread = async (threadId: string) => {
    if (!confirm("Are you sure you want to delete this thread and all its posts?")) return;
    setLoading(`delete-thread-${threadId}`);
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase.from("forum_threads").delete().eq("id", threadId);

    if (!error) {
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    }
    setLoading(null);
  };

  // Suggestion actions
  const updateSuggestionStatus = async (suggestionId: string, status: "approved" | "rejected") => {
    setLoading(`suggestion-${suggestionId}`);
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("wiki_suggestions")
      .update({ status })
      .eq("id", suggestionId);

    if (!error) {
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, status } : s))
      );
    }
    setLoading(null);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <ChartBar className="size-4" /> },
    { id: "users", label: "Users", icon: <Users className="size-4" />, count: stats.userCount },
    { id: "wiki", label: "Wiki", icon: <Article className="size-4" />, count: stats.articleCount },
    { id: "forum", label: "Forum", icon: <Chats className="size-4" />, count: stats.threadCount },
    {
      id: "suggestions",
      label: "Suggestions",
      icon: <BookBookmark className="size-4" />,
      count: stats.pendingSuggestions,
    },
  ];

  return (
    <div className="min-h-full">
      {/* Header */}
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel>admin</SectionLabel>

          <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage users, content, and site settings.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-6 border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="size-4" />
                    <span className="text-sm">Users</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.userCount}</p>
                </div>
                <div className="p-6 border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Article className="size-4" />
                    <span className="text-sm">Articles</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.articleCount}</p>
                </div>
                <div className="p-6 border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Chats className="size-4" />
                    <span className="text-sm">Threads</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.threadCount}</p>
                </div>
                <div className="p-6 border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Chats className="size-4" />
                    <span className="text-sm">Posts</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.postCount}</p>
                </div>
                <div className="p-6 border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <BookBookmark className="size-4" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{stats.pendingSuggestions}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="border border-border bg-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    Recent Users
                  </h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={user.display_name}
                            avatarUrl={user.avatar_url}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {user.display_name || "Anonymous"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(user.created_at)}
                            </p>
                          </div>
                        </div>
                        {user.is_admin && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Suggestions */}
                <div className="border border-border bg-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookBookmark className="size-4 text-primary" />
                    Pending Wiki Suggestions
                  </h3>
                  <div className="space-y-3">
                    {suggestions
                      .filter((s) => s.status === "pending")
                      .slice(0, 5)
                      .map((suggestion) => (
                        <div key={suggestion.id} className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {suggestion.thread?.title || "Unknown thread"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {suggestion.suggested_by?.display_name || "Anonymous"}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateSuggestionStatus(suggestion.id, "approved")}
                              disabled={loading === `suggestion-${suggestion.id}`}
                              className="text-emerald-500 hover:text-emerald-600"
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateSuggestionStatus(suggestion.id, "rejected")}
                              disabled={loading === `suggestion-${suggestion.id}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    {suggestions.filter((s) => s.status === "pending").length === 0 && (
                      <p className="text-sm text-muted-foreground">No pending suggestions</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">User</th>
                      <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Company</th>
                      <th className="text-left p-4 text-sm font-medium hidden sm:table-cell">Posts</th>
                      <th className="text-left p-4 text-sm font-medium hidden lg:table-cell">Joined</th>
                      <th className="text-left p-4 text-sm font-medium">Admin</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={user.display_name}
                              avatarUrl={user.avatar_url}
                              size="sm"
                            />
                            <span className="font-medium">
                              {user.display_name || "Anonymous"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {user.company || "-"}
                        </td>
                        <td className="p-4 hidden sm:table-cell">{user.post_count}</td>
                        <td className="p-4 text-muted-foreground hidden lg:table-cell">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="p-4">
                          {user.is_admin ? (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5">
                              Yes
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAdmin(user.id, user.is_admin)}
                            disabled={loading === `admin-${user.id}`}
                          >
                            {user.is_admin ? (
                              <ShieldSlash className="size-4" />
                            ) : (
                              <ShieldCheck className="size-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Wiki Tab */}
          {activeTab === "wiki" && (
            <div className="space-y-4">
              <div className="border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Title</th>
                      <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Author</th>
                      <th className="text-left p-4 text-sm font-medium hidden sm:table-cell">Category</th>
                      <th className="text-left p-4 text-sm font-medium hidden lg:table-cell">Views</th>
                      <th className="text-left p-4 text-sm font-medium">Status</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-muted/30">
                        <td className="p-4">
                          <Link
                            href={ROUTES.WIKI_ARTICLE(article.slug)}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {article.title}
                          </Link>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {article.author?.display_name || "Anonymous"}
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          {article.category?.name || "-"}
                        </td>
                        <td className="p-4 hidden lg:table-cell">{article.view_count}</td>
                        <td className="p-4">
                          {article.is_published ? (
                            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5">
                              Published
                            </span>
                          ) : (
                            <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePublished(article.id, article.is_published)}
                              disabled={loading === `publish-${article.id}`}
                              title={article.is_published ? "Unpublish" : "Publish"}
                            >
                              {article.is_published ? (
                                <EyeSlash className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteArticle(article.id)}
                              disabled={loading === `delete-article-${article.id}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Forum Tab */}
          {activeTab === "forum" && (
            <div className="space-y-4">
              <div className="border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Title</th>
                      <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Author</th>
                      <th className="text-left p-4 text-sm font-medium hidden sm:table-cell">Category</th>
                      <th className="text-left p-4 text-sm font-medium hidden lg:table-cell">Replies</th>
                      <th className="text-left p-4 text-sm font-medium">Status</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {threads.map((thread) => (
                      <tr key={thread.id} className="hover:bg-muted/30">
                        <td className="p-4">
                          <Link
                            href={ROUTES.FORUM_THREAD(
                              thread.category?.slug || "general",
                              thread.slug
                            )}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {thread.title}
                          </Link>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {thread.author?.display_name || "Anonymous"}
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          {thread.category?.name || "-"}
                        </td>
                        <td className="p-4 hidden lg:table-cell">{thread.reply_count || 0}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {thread.is_pinned && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5">
                                Pinned
                              </span>
                            )}
                            {thread.is_locked && (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5">
                                Locked
                              </span>
                            )}
                            {!thread.is_pinned && !thread.is_locked && (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePinned(thread.id, thread.is_pinned)}
                              disabled={loading === `pin-${thread.id}`}
                              title={thread.is_pinned ? "Unpin" : "Pin"}
                              className={thread.is_pinned ? "text-primary" : ""}
                            >
                              <PushPin className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLocked(thread.id, thread.is_locked)}
                              disabled={loading === `lock-${thread.id}`}
                              title={thread.is_locked ? "Unlock" : "Lock"}
                              className={thread.is_locked ? "text-muted-foreground" : ""}
                            >
                              <Lock className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteThread(thread.id)}
                              disabled={loading === `delete-thread-${thread.id}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Suggestions Tab */}
          {activeTab === "suggestions" && (
            <div className="space-y-4">
              <div className="border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Thread</th>
                      <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Suggested By</th>
                      <th className="text-left p-4 text-sm font-medium hidden sm:table-cell">Date</th>
                      <th className="text-left p-4 text-sm font-medium">Status</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {suggestions.map((suggestion) => (
                      <tr key={suggestion.id} className="hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {suggestion.thread?.title || "Unknown thread"}
                            </span>
                            {suggestion.thread && (
                              <Link
                                href={ROUTES.FORUM_THREAD(
                                  suggestion.thread.category?.slug || "general",
                                  suggestion.thread.slug
                                )}
                                target="_blank"
                                className="text-muted-foreground hover:text-primary"
                              >
                                <ArrowSquareOut className="size-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {suggestion.suggested_by?.display_name || "Anonymous"}
                        </td>
                        <td className="p-4 text-muted-foreground hidden sm:table-cell">
                          {formatDate(suggestion.created_at)}
                        </td>
                        <td className="p-4">
                          {suggestion.status === "pending" && (
                            <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5">
                              Pending
                            </span>
                          )}
                          {suggestion.status === "approved" && (
                            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5">
                              Approved
                            </span>
                          )}
                          {suggestion.status === "rejected" && (
                            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {suggestion.status === "pending" && (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateSuggestionStatus(suggestion.id, "approved")}
                                disabled={loading === `suggestion-${suggestion.id}`}
                                className="text-emerald-500 hover:text-emerald-600"
                              >
                                <Check className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateSuggestionStatus(suggestion.id, "rejected")}
                                disabled={loading === `suggestion-${suggestion.id}`}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
