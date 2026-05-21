"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MarkdownContent } from "@/components/markdown-content";
import { ROUTES } from "@/lib/routes";
import type { WikiCategory } from "@/lib/types";
import { SignIn, CheckCircle, Warning } from "@phosphor-icons/react";

type WikiContributionFormProps = {
  type: "new_entry" | "edit";
  categories: WikiCategory[];
  targetArticleId?: string;
  targetArticleSlug?: string;
  initialValues?: {
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    category_id?: string | null;
  };
};

const TITLE_MAX = 200;
const SUMMARY_MAX = 500;
const CONTENT_MAX = 50000;
const NOTES_MAX = 2000;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function WikiContributionForm({
  type,
  categories,
  targetArticleId,
  targetArticleSlug,
  initialValues,
}: WikiContributionFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState(initialValues?.summary ?? "");
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [submitterNotes, setSubmitterNotes] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const computedSlug = type === "new_entry" && !slugTouched ? slugify(title) : slug;

  const flatCategories = useMemo(() => {
    const out: WikiCategory[] = [];
    const walk = (list: WikiCategory[], prefix = "") => {
      list.forEach((c) => {
        out.push({ ...c, name: prefix ? `${prefix} / ${c.name}` : c.name });
        if (c.children?.length) walk(c.children, prefix ? `${prefix} / ${c.name}` : c.name);
      });
    };
    walk(categories);
    return out;
  }, [categories]);

  const isValid =
    title.trim().length >= 3 &&
    content.trim().length >= 20 &&
    (type === "edit" ? !!targetArticleId : true);

  const handleSubmit = async () => {
    if (!user) return;
    if (!isValid) {
      setError("Please complete title (3+ chars) and content (20+ chars).");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Auth not available.");
        setSubmitting(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Session expired. Please sign in again.");
        setSubmitting(false);
        return;
      }

      const body = {
        type,
        target_article_id: type === "edit" ? targetArticleId : undefined,
        title: title.trim(),
        slug: type === "new_entry" ? (computedSlug || null) : null,
        summary: summary.trim() || null,
        content: content.trim(),
        category_id: categoryId || null,
        submitter_notes: submitterNotes.trim() || null,
      };

      const res = await fetch("/api/wiki/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Failed to submit. Try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
      // Redirect after a short pause so user sees confirmation
      setTimeout(() => {
        if (type === "edit" && targetArticleSlug) {
          router.push(ROUTES.WIKI_ARTICLE(targetArticleSlug));
        } else {
          router.push(ROUTES.WIKI);
        }
      }, 1800);
    } catch (e) {
      console.error(e);
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center border border-dashed border-border max-w-[640px] mx-auto">
        <p className="italic text-[15px] text-muted-foreground mb-4">
          Sign in to {type === "edit" ? "suggest an edit" : "propose a new article"}.
        </p>
        <Link
          href={ROUTES.SIGNIN}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 transition-colors"
        >
          <SignIn className="w-3.5 h-3.5" />
          Sign in
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-12 text-center border border-dashed border-border max-w-[640px] mx-auto">
        <CheckCircle className="w-10 h-10 text-accent mx-auto mb-3" />
        <h2 className="font-heading font-semibold text-[22px] mb-2">Submitted for review</h2>
        <p className="text-[15px] text-muted-foreground">
          Thanks — an admin will review your{" "}
          {type === "edit" ? "edit suggestion" : "new entry"} soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="wiki-title"
          className="block font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-1.5"
        >
          Title
        </label>
        <input
          id="wiki-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
          placeholder="Short, descriptive title"
          className="w-full border border-border bg-card focus:border-foreground transition-colors outline-none p-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-sans"
        />
        <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground tabular-nums mt-1">
          {title.length}/{TITLE_MAX}
        </div>
      </div>

      {type === "new_entry" && (
        <div>
          <label
            htmlFor="wiki-slug"
            className="block font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-1.5"
          >
            Slug <span className="text-muted-foreground/60">(URL — auto-generated)</span>
          </label>
          <input
            id="wiki-slug"
            type="text"
            value={computedSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "-")
                  .replace(/-+/g, "-")
                  .slice(0, 120)
              );
            }}
            placeholder="my-article-slug"
            className="w-full border border-border bg-card focus:border-foreground transition-colors outline-none p-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-mono"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="wiki-summary"
          className="block font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-1.5"
        >
          Summary <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <input
          id="wiki-summary"
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value.slice(0, SUMMARY_MAX))}
          placeholder="One-line summary"
          className="w-full border border-border bg-card focus:border-foreground transition-colors outline-none p-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-sans"
        />
        <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground tabular-nums mt-1">
          {summary.length}/{SUMMARY_MAX}
        </div>
      </div>

      <div>
        <label
          htmlFor="wiki-category"
          className="block font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-1.5"
        >
          Category
        </label>
        <select
          id="wiki-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border border-border bg-card focus:border-foreground transition-colors outline-none p-3 text-[14px] text-foreground font-sans"
        >
          <option value="">— None —</option>
          {flatCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="wiki-content"
            className="block font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground"
          >
            Content (markdown)
          </label>
          <div className="flex gap-0 border border-border">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`px-3 py-1 font-mono text-[10px] uppercase tracking-[1.2px] transition-colors ${
                tab === "write"
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`px-3 py-1 font-mono text-[10px] uppercase tracking-[1.2px] transition-colors ${
                tab === "preview"
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {tab === "write" ? (
          <textarea
            id="wiki-content"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX))}
            rows={18}
            placeholder="# Heading&#10;&#10;Write the article here. Markdown is supported."
            className="w-full border border-border bg-card focus:border-foreground transition-colors outline-none p-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-mono resize-y"
          />
        ) : (
          <div className="border border-border bg-card p-4 min-h-[400px]">
            {content.trim() ? (
              <MarkdownContent content={content} />
            ) : (
              <p className="italic text-muted-foreground text-[14px]">
                Nothing to preview yet.
              </p>
            )}
          </div>
        )}
        <div className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground tabular-nums mt-1">
          {content.length}/{CONTENT_MAX}
        </div>
      </div>

      <div>
        <label
          htmlFor="wiki-notes"
          className="block font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-1.5"
        >
          Notes to reviewer <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <textarea
          id="wiki-notes"
          value={submitterNotes}
          onChange={(e) => setSubmitterNotes(e.target.value.slice(0, NOTES_MAX))}
          rows={3}
          placeholder="Anything the admin should know about this submission."
          className="w-full border border-border bg-card focus:border-foreground transition-colors outline-none p-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic font-sans resize-y"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 border border-destructive/30 bg-destructive/5 text-destructive text-[13px]">
          <Warning className="size-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-[12px] text-muted-foreground italic">
          {type === "edit"
            ? "Your edit will go to an admin for review."
            : "Your submission will go to an admin for review."}
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          className="px-5 py-2.5 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? "Submitting…"
            : type === "edit"
              ? "Submit edit for review"
              : "Submit for review"}
        </button>
      </div>
    </div>
  );
}
