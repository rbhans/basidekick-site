"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import type { PointStackJobType, PointStackPostType } from "@/lib/types";

function slugify(value: string) {
  return `${value.toLowerCase().trim().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
}

export function PointStackPostForm({ userId, initialType }: { userId: string; initialType: PointStackPostType }) {
  const router = useRouter();
  const [postType, setPostType] = useState<PointStackPostType>(initialType);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = createClient();
    if (!client || busy) return;
    setBusy(true);
    setStatus("");
    const slug = slugify(title);
    const { error } = await client.from("pointstack_posts").insert({
      author_id: userId,
      post_type: postType,
      title: title.trim(),
      content: content.trim(),
      slug,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      metadata: {},
    });
    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }
    router.push(postType === "project" ? `/pointstack/projects/${slug}` : `/pointstack/posts/${slug}`);
    router.refresh();
  }

  return <><PageHeader eyebrow="POINTSTACK / CONTRIBUTE" title="Create a post" description="Share a useful question, project, discussion, or field tip with the BAS community." /><form className="submission-form" onSubmit={submit}><label><span>Post type</span><select value={postType} onChange={(event) => setPostType(event.target.value as PointStackPostType)}><option value="discussion">Discussion</option><option value="question">Question</option><option value="project">Project</option><option value="tip">Field tip</option></select></label><label><span>Title</span><input required minLength={4} maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label><span>Details</span><textarea required minLength={10} maxLength={20000} value={content} onChange={(event) => setContent(event.target.value)} /></label><label><span>Tags</span><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="BACnet, Niagara, commissioning" /></label><button className="button primary" type="submit" disabled={busy}>{busy ? "Publishing…" : "Publish post"}</button>{status && <p className="form-status error" role="alert">{status}</p>}</form></>;
}

export function PointStackJobForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [jobType, setJobType] = useState<PointStackJobType>("full-time");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [applicationUrl, setApplicationUrl] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = createClient();
    if (!client || busy) return;
    setBusy(true);
    setStatus("");
    const slug = slugify(title);
    const { error } = await client.from("pointstack_jobs").insert({
      posted_by: userId,
      title: title.trim(),
      slug,
      description: description.trim(),
      requirements: requirements.trim() || null,
      job_type: jobType,
      location: location.trim() || null,
      is_remote: remote,
      salary_currency: "USD",
      application_url: applicationUrl.trim() || null,
      application_email: applicationEmail.trim() || null,
    });
    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }
    router.push(`/pointstack/jobs/${slug}`);
    router.refresh();
  }

  return <><PageHeader eyebrow="POINTSTACK / JOBS" title="Post a job" description="List a controls, integration, commissioning, or adjacent role. Applications stay with the employer." /><form className="submission-form" onSubmit={submit}><label><span>Title</span><input required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label><span>Description</span><textarea required minLength={20} maxLength={20000} value={description} onChange={(event) => setDescription(event.target.value)} /></label><label><span>Requirements</span><textarea maxLength={10000} value={requirements} onChange={(event) => setRequirements(event.target.value)} /></label><div><label><span>Job type</span><select value={jobType} onChange={(event) => setJobType(event.target.value as PointStackJobType)}><option value="full-time">Full time</option><option value="part-time">Part time</option><option value="contract">Contract</option><option value="freelance">Freelance</option><option value="internship">Internship</option></select></label><label><span>Location</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, state or region" /></label></div><label className="check-field"><input type="checkbox" checked={remote} onChange={(event) => setRemote(event.target.checked)} /> Remote role</label><div><label><span>Application URL</span><input type="url" value={applicationUrl} onChange={(event) => setApplicationUrl(event.target.value)} /></label><label><span>Application email</span><input type="email" value={applicationEmail} onChange={(event) => setApplicationEmail(event.target.value)} /></label></div><button className="button primary" type="submit" disabled={busy || (!applicationUrl && !applicationEmail)}>{busy ? "Publishing…" : "Publish job"}</button>{status && <p className="form-status error" role="alert">{status}</p>}</form></>;
}

export function WikiContributionForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = createClient();
    if (!client || busy) return;
    setBusy(true);
    setStatus("");
    const { error } = await client.from("wiki_contributions").insert({
      user_id: userId,
      type: "new_entry",
      title: title.trim(),
      slug: slugify(title),
      summary: summary.trim() || null,
      content: content.trim(),
      submitter_notes: notes.trim() || null,
      status: "pending",
    });
    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }
    setStatus("Submitted for review.");
    setBusy(false);
    router.refresh();
  }

  return <><PageHeader eyebrow="WIKI / CONTRIBUTE" title="Suggest an article" description="Submit a source-aware field article for review. Nothing is published until it passes the existing moderation flow." /><form className="submission-form" onSubmit={submit}><label><span>Title</span><input required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label><span>Summary</span><textarea required minLength={10} maxLength={600} value={summary} onChange={(event) => setSummary(event.target.value)} /></label><label><span>Article content</span><textarea required minLength={50} maxLength={50000} value={content} onChange={(event) => setContent(event.target.value)} /></label><label><span>Notes for the reviewer</span><textarea maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><button className="button primary" type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit for review"}</button>{status && <p className="form-status" role="status">{status}</p>}</form></>;
}

export function WikiEditSuggestionForm({ userId, articleId, articleTitle, initialSummary, initialContent }: { userId: string; articleId: string; articleTitle: string; initialSummary: string; initialContent: string }) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [content, setContent] = useState(initialContent);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const client = createClient();
    if (!client || busy) return;
    setBusy(true);
    setStatus("");
    const { error } = await client.from("wiki_contributions").insert({
      user_id: userId,
      type: "edit",
      target_article_id: articleId,
      title: articleTitle,
      summary: summary.trim() || null,
      content: content.trim(),
      submitter_notes: notes.trim() || null,
      status: "pending",
    });
    if (error) {
      setStatus(error.message);
      setBusy(false);
      return;
    }
    setStatus("Edit suggestion submitted for review.");
    setBusy(false);
    router.refresh();
  }

  return <><PageHeader eyebrow="WIKI / SUGGEST EDIT" title={`Improve ${articleTitle}`} description="Propose a specific correction or useful addition. The current article stays published until an admin reviews the change." /><form className="submission-form" onSubmit={submit}><label><span>Summary</span><textarea required minLength={10} maxLength={600} value={summary} onChange={(event) => setSummary(event.target.value)} /></label><label><span>Revised article content</span><textarea required minLength={50} maxLength={50000} value={content} onChange={(event) => setContent(event.target.value)} /></label><label><span>What changed and why?</span><textarea required maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><button className="button primary" type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit edit suggestion"}</button>{status && <p className="form-status" role="status">{status}</p>}</form></>;
}
