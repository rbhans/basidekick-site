"use client";

import Link from "next/link";
import { ArrowSquareOut, Check, Eye, EyeSlash, ShieldCheck, X } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { PageHeader, Pill, SectionTitle } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

type ResourceRow = { id: string; title: string; slug: string; category: string; is_active: boolean; created_at: string; author?: { display_name: string | null } | { display_name: string | null }[] | null };
type WikiContributionRow = { id: string; type: string; title: string; slug: string | null; summary: string | null; content: string; category_id: string | null; status: string; created_at: string; submitter?: { display_name: string | null } | { display_name: string | null }[] | null };
type CompanyRow = { id: string; name: string; slug: string; is_verified: boolean; created_at: string };
type ReportRow = { id: string; target_type: string; target_label: string | null; target_url: string | null; message: string; status: string; created_at: string };
type NewsRow = { id: string; title: string; slug: string; is_published: boolean; created_at: string };
type UserRow = { id: string; display_name: string | null; username: string | null; role: string; created_at: string };

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function relation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export function AdminConsole({ adminId, initialResources, initialContributions, initialCompanies, initialReports, initialNews, users }: {
  adminId: string;
  initialResources: ResourceRow[];
  initialContributions: WikiContributionRow[];
  initialCompanies: CompanyRow[];
  initialReports: ReportRow[];
  initialNews: NewsRow[];
  users: UserRow[];
}) {
  const client = useMemo(() => createClient(), []);
  const [resources, setResources] = useState(initialResources);
  const [contributions, setContributions] = useState(initialContributions);
  const [companies, setCompanies] = useState(initialCompanies);
  const [reports, setReports] = useState(initialReports);
  const [news, setNews] = useState(initialNews);
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState("");

  async function updateRow(table: string, id: string, values: Record<string, unknown>) {
    if (!client) throw new Error("Supabase is not configured.");
    const { error } = await client.from(table).update(values).eq("id", id);
    if (error) throw error;
  }

  async function perform(id: string, task: () => Promise<void>) {
    setBusyId(id);
    setStatus("");
    try {
      await task();
      setStatus("Moderation change saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save the moderation change.");
    } finally {
      setBusyId("");
    }
  }

  async function publishContribution(item: WikiContributionRow) {
    if (!client) return;
    await perform(item.id, async () => {
      const slug = item.slug || `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
      const { data: article, error } = await client.from("wiki_articles").insert({
        author_id: adminId,
        category_id: item.category_id,
        title: item.title,
        slug,
        summary: item.summary,
        content: item.content,
        is_published: true,
      }).select("id").single();
      if (error) throw error;
      await updateRow("wiki_contributions", item.id, {
        status: "approved",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        approved_article_id: article.id,
      });
      setContributions((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, status: "approved" } : candidate));
    });
  }

  return (
    <>
      <PageHeader eyebrow="ADMIN / MODERATION" title="Administration" description="Review the public workspace surfaces that remain active while Atlas is rebuilt." actions={<Pill tone="accent"><ShieldCheck size={13} /> Admin only</Pill>} />
      <section className="admin-metrics">
        <div><strong>{contributions.filter((item) => item.status === "pending").length}</strong><span>Wiki reviews</span></div>
        <div><strong>{resources.filter((item) => !item.is_active).length}</strong><span>Hidden Library entries</span></div>
        <div><strong>{reports.filter((item) => item.status === "pending").length}</strong><span>Open reports</span></div>
        <div><strong>{companies.filter((item) => !item.is_verified).length}</strong><span>Unverified companies</span></div>
      </section>
      {status && <p className="form-status" role="status">{status}</p>}

      <div className="admin-grid">
        <section className="admin-panel">
          <SectionTitle index="01" title="Wiki contributions" />
          <div className="admin-list">{contributions.map((item) => <article key={item.id}><div><Pill tone={item.status === "pending" ? "warning" : item.status === "approved" ? "success" : "neutral"}>{item.status}</Pill><strong>{item.title}</strong><small>{relation(item.submitter)?.display_name ?? "Member"} · {formatDate(item.created_at)}</small></div>{item.status === "pending" && <span><button type="button" disabled={busyId === item.id} onClick={() => publishContribution(item)}><Check size={14} /> Publish</button><button type="button" disabled={busyId === item.id} onClick={() => perform(item.id, async () => { await updateRow("wiki_contributions", item.id, { status: "rejected", reviewed_by: adminId, reviewed_at: new Date().toISOString() }); setContributions((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, status: "rejected" } : candidate)); })}><X size={14} /> Reject</button></span>}</article>)}</div>
        </section>

        <section className="admin-panel">
          <SectionTitle index="02" title="Library" />
          <div className="admin-list">{resources.map((item) => <article key={item.id}><div><Pill>{item.category}</Pill><Link href={`/library/${item.slug}`}>{item.title} <ArrowSquareOut size={12} /></Link><small>{relation(item.author)?.display_name ?? "Member"} · {formatDate(item.created_at)}</small></div><button type="button" disabled={busyId === item.id} onClick={() => perform(item.id, async () => { await updateRow("pointstack_resource_listings", item.id, { is_active: !item.is_active }); setResources((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, is_active: !candidate.is_active } : candidate)); })}>{item.is_active ? <><EyeSlash size={14} /> Hide</> : <><Eye size={14} /> Publish</>}</button></article>)}</div>
        </section>

        <section className="admin-panel">
          <SectionTitle index="03" title="Companies" />
          <div className="admin-list">{companies.map((item) => <article key={item.id}><div><Link href={`/pointstack/companies/${item.slug}`}>{item.name} <ArrowSquareOut size={12} /></Link><small>{formatDate(item.created_at)}</small></div><button type="button" disabled={busyId === item.id} onClick={() => perform(item.id, async () => { await updateRow("pointstack_companies", item.id, { is_verified: !item.is_verified }); setCompanies((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, is_verified: !candidate.is_verified } : candidate)); })}>{item.is_verified ? "Remove verification" : "Verify"}</button></article>)}</div>
        </section>

        <section className="admin-panel">
          <SectionTitle index="04" title="Content reports" />
          <div className="admin-list">{reports.map((item) => <article key={item.id}><div><Pill tone={item.status === "pending" ? "warning" : "success"}>{item.status}</Pill><strong>{item.target_label || item.target_type}</strong><small>{item.message} · {formatDate(item.created_at)}</small></div>{item.status === "pending" && <button type="button" disabled={busyId === item.id} onClick={() => perform(item.id, async () => { await updateRow("content_reports", item.id, { status: "resolved", resolved_by: adminId, resolved_at: new Date().toISOString() }); setReports((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, status: "resolved" } : candidate)); })}><Check size={14} /> Resolve</button>}</article>)}</div>
        </section>

        <section className="admin-panel">
          <SectionTitle index="05" title="News" />
          <div className="admin-list">{news.map((item) => <article key={item.id}><div><Link href={`/news/${item.slug}`}>{item.title} <ArrowSquareOut size={12} /></Link><small>{formatDate(item.created_at)}</small></div><button type="button" disabled={busyId === item.id} onClick={() => perform(item.id, async () => { await updateRow("news_articles", item.id, { is_published: !item.is_published }); setNews((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, is_published: !candidate.is_published } : candidate)); })}>{item.is_published ? "Unpublish" : "Publish"}</button></article>)}</div>
        </section>

        <section className="admin-panel">
          <SectionTitle index="06" title="Members" />
          <div className="admin-list">{users.map((item) => <article key={item.id}><div><Pill>{item.role}</Pill><strong>{item.display_name ?? item.username ?? "Unnamed member"}</strong><small>{formatDate(item.created_at)}</small></div></article>)}</div>
        </section>
      </div>
    </>
  );
}
