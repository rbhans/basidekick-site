"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/routes";
import {
  Users,
  Article,
  ChartBar,
  Eye,
  EyeSlash,
  Trash,
  Check,
  X,
  ShieldCheck,
  ShieldSlash,
  CaretDown,
  CaretUp,
  Translate,
  Bug,
  PencilSimple,
  Plus,
  GithubLogo,
  Gauge,
  Buildings,
} from "@phosphor-icons/react";

interface AdminUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: "member" | "moderator" | "admin";
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

interface AdminCompany {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  is_verified: boolean;
  created_at: string;
  owner: { display_name: string | null; avatar_url: string | null } | null;
}

interface AdminBabelContribution {
  id: string;
  type: "error" | "edit" | "new_entry";
  entry_id: string | null;
  entry_type: "point" | "equipment" | null;
  entry_category: string | null;
  title: string;
  description: string;
  suggested_changes: Record<string, unknown> | null;
  status: "pending" | "approved" | "rejected";
  reviewer_notes: string | null;
  github_issue_url: string | null;
  created_at: string;
  submitter: { display_name: string | null } | null;
}

interface AdminEquipmentSubmission {
  id: string;
  type: "error" | "edit" | "new_entry";
  entry_id: string | null;
  brand_id: string | null;
  brand_name: string | null;
  brand_logo_url: string | null;
  type_id: string | null;
  type_name: string | null;
  model_name: string | null;
  model_numbers: string[] | null;
  protocols: string[] | null;
  model_status: string | null;
  description: string | null;
  manufacturer_url: string | null;
  image_url: string | null;
  suggested_changes: Record<string, unknown> | null;
  review_status: "pending" | "approved" | "rejected";
  reviewer_notes: string | null;
  github_issue_url: string | null;
  created_at: string;
  submitter: { display_name: string | null } | null;
}

interface AdminStats {
  userCount: number;
  articleCount: number;
  companyCount: number;
  pendingBabelContributions: number;
  pendingEquipmentSubmissions: number;
}

interface AdminViewProps {
  users: AdminUser[];
  articles: AdminArticle[];
  companies: AdminCompany[];
  babelContributions: AdminBabelContribution[];
  equipmentSubmissions: AdminEquipmentSubmission[];
  stats: AdminStats;
}

type TabId = "overview" | "users" | "wiki" | "babel" | "equipment" | "companies";

export function AdminView({
  users: initialUsers,
  articles: initialArticles,
  companies: initialCompanies,
  babelContributions: initialBabelContributions,
  equipmentSubmissions: initialEquipmentSubmissions,
  stats,
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [users, setUsers] = useState(initialUsers);
  const [articles, setArticles] = useState(initialArticles);
  const [companies, setCompanies] = useState(initialCompanies);
  const [babelContributions, setBabelContributions] = useState(initialBabelContributions);
  const [equipmentSubmissions, setEquipmentSubmissions] = useState(initialEquipmentSubmissions);
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedContribution, setExpandedContribution] = useState<string | null>(null);
  const [expandedEquipmentSubmission, setExpandedEquipmentSubmission] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // User actions
  const toggleAdmin = async (userId: string, currentRole: "member" | "moderator" | "admin") => {
    setLoading(`admin-${userId}`);
    const supabase = createClient();
    if (!supabase) return;

    const newRole = currentRole === "admin" ? "member" : "admin";
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
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

  // Company actions
  const toggleVerified = async (companyId: string, currentStatus: boolean) => {
    setLoading(`verify-${companyId}`);
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase
      .from("pointstack_companies")
      .update({ is_verified: !currentStatus })
      .eq("id", companyId);

    if (!error) {
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === companyId ? { ...company, is_verified: !currentStatus } : company
        )
      );
    }
    setLoading(null);
  };

  const deleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete ${companyName}?`)) return;
    setLoading(`delete-company-${companyId}`);
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase.from("pointstack_companies").delete().eq("id", companyId);

    if (!error) {
      setCompanies((prev) => prev.filter((company) => company.id !== companyId));
    }
    setLoading(null);
  };

  // Babel contribution actions
  const handleBabelContributionAction = async (
    contributionId: string,
    action: "approve" | "reject"
  ) => {
    setLoading(`babel-${contributionId}`);
    const supabase = createClient();
    if (!supabase) return;

    // Get the current user for reviewer_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(null);
      return;
    }

    try {
      const response = await fetch(`/api/babel/contributions/${contributionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewer_id: user.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBabelContributions((prev) =>
          prev.map((c) =>
            c.id === contributionId
              ? {
                  ...c,
                  status: action === "approve" ? "approved" : "rejected",
                  github_issue_url: result.github_issue_url || null,
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Failed to update contribution:", error);
    }

    setLoading(null);
  };

  const handleEquipmentSubmissionAction = async (
    submissionId: string,
    action: "approve" | "reject"
  ) => {
    setLoading(`equipment-${submissionId}`);
    try {
      const response = await fetch(`/api/equipment/submissions/${submissionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update submission");
        return;
      }

      const result = await response.json();

      setEquipmentSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === submissionId
            ? { ...submission, review_status: action === "approve" ? "approved" : "rejected", github_issue_url: result.github_issue_url || submission.github_issue_url }
            : submission
        )
      );
    } catch (error) {
      console.error("Error updating equipment submission:", error);
      alert("Failed to update submission. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const getContributionTypeIcon = (type: string) => {
    switch (type) {
      case "error":
        return <Bug className="size-4" />;
      case "edit":
        return <PencilSimple className="size-4" />;
      case "new_entry":
        return <Plus className="size-4" />;
      default:
        return null;
    }
  };

  const getContributionTypeLabel = (type: string) => {
    switch (type) {
      case "error":
        return "Error Report";
      case "edit":
        return "Edit Suggestion";
      case "new_entry":
        return "New Entry Request";
      default:
        return type;
    }
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "overview", label: "Overview", icon: <ChartBar className="size-4" /> },
    { id: "users", label: "Users", icon: <Users className="size-4" />, count: stats.userCount },
    { id: "wiki", label: "Wiki", icon: <Article className="size-4" />, count: stats.articleCount },
    {
      id: "babel",
      label: "Atlas Terms",
      icon: <Translate className="size-4" />,
      count: stats.pendingBabelContributions,
    },
    {
      id: "equipment",
      label: "Atlas",
      icon: <Gauge className="size-4" />,
      count: stats.pendingEquipmentSubmissions,
    },
    {
      id: "companies",
      label: "Companies",
      icon: <Buildings className="size-4" />,
      count: stats.companyCount,
    },
  ];

  return (
    <div className="min-h-full">
      {/* Title block strip */}
      <div className="title-block">
        <div className="field">
          <span className="field-label">Drawing</span>
          <span className="field-value">Admin</span>
        </div>
        <div className="field">
          <span className="field-label">Title</span>
          <span className="field-value">Dashboard</span>
        </div>
        <div className="field">
          <span className="field-label">Users</span>
          <span className="field-value tabular-nums">{stats.userCount}</span>
        </div>
        <div className="field">
          <span className="field-label">Articles</span>
          <span className="field-value tabular-nums">{stats.articleCount}</span>
        </div>
        <div className="spacer" />
        <div className="field">
          <span className="field-label">Pending</span>
          <span className="field-value tabular-nums text-accent">
            {stats.pendingBabelContributions + stats.pendingEquipmentSubmissions}
          </span>
        </div>
      </div>

      <section className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-16 pt-10 pb-4">
        <div className="pb-5 border-b border-foreground mb-0">
          <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
            Admin
          </div>
          <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground">
            Dashboard
          </h1>
          <p className="font-heading italic text-[15px] text-muted-foreground mt-2">
            Manage users, content, and site settings.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-16 border-b border-border">
        <div className="flex gap-0 overflow-x-auto -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[1.2px] border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] tabular-nums bg-muted border border-border text-muted-foreground">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-6 border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="size-4" />
                    <span className="text-sm">Users</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.userCount}</p>
                </div>
                <div className="p-6 border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Article className="size-4" />
                    <span className="text-sm">Articles</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.articleCount}</p>
                </div>
                <div className="p-6 border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Buildings className="size-4" />
                    <span className="text-sm">Companies</span>
                  </div>
                  <p className="text-3xl font-bold">{companies.length}</p>
                </div>
                <div className="p-6 border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Translate className="size-4" />
                    <span className="text-sm">Atlas Terms Pending</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{stats.pendingBabelContributions}</p>
                </div>
                <div className="p-6 border border-border bg-card shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Gauge className="size-4" />
                    <span className="text-sm">Atlas Pending</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{stats.pendingEquipmentSubmissions}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="border border-border bg-card shadow-sm p-6">
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
                        {user.role === "admin" && (
                          <span className="text-xs bg-secondary text-primary px-2 py-0.5">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newest Companies */}
                <div className="border border-border bg-card shadow-sm p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Buildings className="size-4 text-primary" />
                    Newest Companies
                  </h3>
                  <div className="space-y-3">
                    {companies.slice(0, 5).map((company) => (
                      <div key={company.id} className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {company.owner?.display_name || "No owner"} · {formatDate(company.created_at)}
                          </p>
                        </div>
                        {company.is_verified && (
                          <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5">
                            Verified
                          </span>
                        )}
                      </div>
                    ))}
                    {companies.length === 0 && (
                      <p className="text-sm text-muted-foreground">No companies yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="border border-border bg-card shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">User</th>
                      <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Company</th>
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
                        <td className="p-4 text-muted-foreground hidden lg:table-cell">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="p-4">
                          {user.role === "admin" ? (
                            <span className="text-xs bg-secondary text-primary px-2 py-0.5">
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
                            onClick={() => toggleAdmin(user.id, user.role)}
                            disabled={loading === `admin-${user.id}`}
                          >
                            {user.role === "admin" ? (
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
              <div className="border border-border bg-card shadow-sm overflow-hidden">
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
                            className="font-medium hover:text-accent transition-colors"
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

          {/* Companies Tab */}
          {activeTab === "companies" && (
            <div className="space-y-4">
              <div className="border border-border bg-card shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Name</th>
                      <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Owner</th>
                      <th className="text-left p-4 text-sm font-medium hidden sm:table-cell">Verified</th>
                      <th className="text-left p-4 text-sm font-medium hidden lg:table-cell">Created</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {companies.map((company) => (
                      <tr key={company.id} className="hover:bg-muted/30">
                        <td className="p-4">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{company.name}</p>
                            <p className="text-xs text-muted-foreground">/{company.slug}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              name={company.owner?.display_name ?? null}
                              avatarUrl={company.owner?.avatar_url ?? null}
                              size="sm"
                            />
                            <span className="text-sm text-muted-foreground">
                              {company.owner?.display_name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          {company.is_verified ? (
                            <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5">
                              Verified
                            </span>
                          ) : (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground hidden lg:table-cell">
                          {formatDate(company.created_at)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleVerified(company.id, company.is_verified)}
                              disabled={loading === `verify-${company.id}`}
                              title={company.is_verified ? "Unverify" : "Verify"}
                              className={company.is_verified ? "text-emerald-600" : ""}
                            >
                              {company.is_verified ? (
                                <X className="size-4" />
                              ) : (
                                <Check className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCompany(company.id, company.name)}
                              disabled={loading === `delete-company-${company.id}`}
                              className="text-destructive hover:text-destructive"
                              title="Delete company"
                            >
                              <Trash className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {companies.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No companies yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment Submissions Tab */}
          {activeTab === "equipment" && (
            <div className="space-y-4">
              <div className="border border-border bg-card shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Submission</th>
                      <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Type</th>
                      <th className="text-left p-4 text-sm font-medium hidden sm:table-cell">Brand</th>
                      <th className="text-left p-4 text-sm font-medium hidden lg:table-cell">Submitted By</th>
                      <th className="text-left p-4 text-sm font-medium">Status</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {equipmentSubmissions.map((submission) => (
                      <Fragment key={submission.id}>
                        <tr
                          className="hover:bg-muted/30 cursor-pointer"
                          onClick={() =>
                            setExpandedEquipmentSubmission(
                              expandedEquipmentSubmission === submission.id ? null : submission.id
                            )
                          }
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button className="text-muted-foreground">
                                {expandedEquipmentSubmission === submission.id ? (
                                  <CaretUp className="size-4" />
                                ) : (
                                  <CaretDown className="size-4" />
                                )}
                              </button>
                              <span className="font-medium">{submission.model_name || submission.entry_id || "New equipment"}</span>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {getContributionTypeIcon(submission.type)}
                              <span className="text-sm">{getContributionTypeLabel(submission.type)}</span>
                            </div>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <span className="text-sm">{submission.brand_name || submission.brand_id || "-"}</span>
                          </td>
                          <td className="p-4 text-muted-foreground hidden lg:table-cell">
                            {submission.submitter?.display_name || "Anonymous"}
                          </td>
                          <td className="p-4">
                            {submission.review_status === "pending" && (
                              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5">
                                Pending
                              </span>
                            )}
                            {submission.review_status === "approved" && (
                              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5">
                                Approved
                              </span>
                            )}
                            {submission.review_status === "rejected" && (
                              <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            {submission.review_status === "pending" ? (
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEquipmentSubmissionAction(submission.id, "approve")}
                                  disabled={loading === `equipment-${submission.id}`}
                                  className="text-emerald-500 hover:text-emerald-600"
                                  title="Approve and create GitHub issue"
                                >
                                  <Check className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEquipmentSubmissionAction(submission.id, "reject")}
                                  disabled={loading === `equipment-${submission.id}`}
                                  className="text-destructive hover:text-destructive"
                                  title="Reject"
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ) : submission.github_issue_url ? (
                              <a
                                href={submission.github_issue_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-accent"
                                title="View GitHub issue"
                              >
                                <GithubLogo className="size-4" />
                              </a>
                            ) : null}
                          </td>
                        </tr>
                        {expandedEquipmentSubmission === submission.id && (
                          <tr key={`${submission.id}-detail`} className="bg-muted/20">
                            <td colSpan={6} className="p-4">
                              <div className="space-y-3">
                                {submission.description && (
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                      Description
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap">{submission.description}</p>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                  {submission.type_name && <span>Type: {submission.type_name}</span>}
                                  {submission.model_numbers && submission.model_numbers.length > 0 && (
                                    <span>Model Numbers: {submission.model_numbers.join(", ")}</span>
                                  )}
                                  {submission.protocols && submission.protocols.length > 0 && (
                                    <span>Protocols: {submission.protocols.join(", ")}</span>
                                  )}
                                  {submission.model_status && <span>Status: {submission.model_status}</span>}
                                </div>
                                {submission.image_url && (
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Image</p>
                                    <img src={submission.image_url} alt="Submission" className="max-h-48 rounded" />
                                  </div>
                                )}
                                {submission.suggested_changes && (
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                      Suggested Changes
                                    </p>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                      {JSON.stringify(submission.suggested_changes, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>Submitted: {formatDate(submission.created_at)}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
                {equipmentSubmissions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No equipment submissions yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Atlas Terms Contributions Tab */}
          {activeTab === "babel" && (
            <div className="space-y-4">
              <div className="border border-border bg-card shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Contribution</th>
                      <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Type</th>
                      <th className="text-left p-4 text-sm font-medium hidden sm:table-cell">Entry</th>
                      <th className="text-left p-4 text-sm font-medium hidden lg:table-cell">Submitted By</th>
                      <th className="text-left p-4 text-sm font-medium">Status</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {babelContributions.map((contribution) => (
                      <Fragment key={contribution.id}>
                        <tr
                          className="hover:bg-muted/30 cursor-pointer"
                          onClick={() =>
                            setExpandedContribution(
                              expandedContribution === contribution.id ? null : contribution.id
                            )
                          }
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button className="text-muted-foreground">
                                {expandedContribution === contribution.id ? (
                                  <CaretUp className="size-4" />
                                ) : (
                                  <CaretDown className="size-4" />
                                )}
                              </button>
                              <span className="font-medium">{contribution.title}</span>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {getContributionTypeIcon(contribution.type)}
                              <span className="text-sm">{getContributionTypeLabel(contribution.type)}</span>
                            </div>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            {contribution.entry_id ? (
                              <Link
                                href={ROUTES.ATLAS_ENTRY(contribution.entry_id)}
                                className="font-mono text-sm text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {contribution.entry_id}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-sm">New entry</span>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground hidden lg:table-cell">
                            {contribution.submitter?.display_name || "Anonymous"}
                          </td>
                          <td className="p-4">
                            {contribution.status === "pending" && (
                              <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5">
                                Pending
                              </span>
                            )}
                            {contribution.status === "approved" && (
                              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5">
                                Approved
                              </span>
                            )}
                            {contribution.status === "rejected" && (
                              <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            {contribution.status === "pending" ? (
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBabelContributionAction(contribution.id, "approve")}
                                  disabled={loading === `babel-${contribution.id}`}
                                  className="text-emerald-500 hover:text-emerald-600"
                                  title="Approve and create GitHub issue"
                                >
                                  <Check className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBabelContributionAction(contribution.id, "reject")}
                                  disabled={loading === `babel-${contribution.id}`}
                                  className="text-destructive hover:text-destructive"
                                  title="Reject"
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                            ) : contribution.github_issue_url ? (
                              <a
                                href={contribution.github_issue_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-accent"
                                title="View GitHub issue"
                              >
                                <GithubLogo className="size-4" />
                              </a>
                            ) : null}
                          </td>
                        </tr>
                        {expandedContribution === contribution.id && (
                          <tr key={`${contribution.id}-detail`} className="bg-muted/20">
                            <td colSpan={6} className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                    Description
                                  </p>
                                  <p className="text-sm whitespace-pre-wrap">{contribution.description}</p>
                                </div>
                                {contribution.suggested_changes && (
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                      Suggested Changes
                                    </p>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                      {JSON.stringify(contribution.suggested_changes, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>
                                    Submitted: {formatDate(contribution.created_at)}
                                  </span>
                                  {contribution.entry_type && (
                                    <span>
                                      Type: {contribution.entry_type}
                                    </span>
                                  )}
                                  {contribution.entry_category && (
                                    <span>
                                      Category: {contribution.entry_category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
                {babelContributions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No Atlas terms contributions yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
