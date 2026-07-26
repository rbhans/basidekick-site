"use client";

import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  ChatCircle,
  CheckCircle,
  MagnifyingGlass,
  Plus,
  Users,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/providers";
import { DenseRow, EmptyState, PageHeader, Pill, SectionTitle } from "@/components/ui";
import { EngagementPanel } from "@/components/engagement-panel";
import { RecentViewTracker, SaveButton, type PersonalizationKind } from "@/components/personalization";
import { FALLBACK_NEWS, FALLBACK_POSTS, FALLBACK_WIKI } from "@/lib/fallback-data";
import { INTRO_TO_BAS, INTRO_TO_BAS_MINUTES } from "@/lib/course-data";
import { TOOL_CARDS } from "@/lib/navigation";
import { companies } from "@/lib/data/pointstack-companies";
import { projects } from "@/lib/data/pointstack-projects";

function ListToolbar({ value, onChange, placeholder, label, end }: { value: string; onChange: (value: string) => void; placeholder: string; label: string; end?: React.ReactNode }) {
  return <div className="explorer-toolbar"><label className="field-search"><MagnifyingGlass size={16} /><input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>{end}</div>;
}

export type NewsListItem = { slug: string; source: string; age: string; title: string; summary: string; tags: string[]; votes: number; comments: number };
export type WikiListItem = { slug: string; category: string; title: string; summary: string; updated: string };
export type PointStackListItem = { slug: string; kind: string; title: string; author: string; tags: string[]; meta: string };
export type PointStackPersonItem = { username: string; name: string; headline: string; location: string; verified: boolean };
export type PointStackJobItem = { slug: string; title: string; meta: string; summary: string; tags: string[]; end: string };
export type PointStackCompanyItem = { slug: string; name: string; description: string; location: string; industry: string; verified: boolean };

export function NewsView({ initialItems = FALLBACK_NEWS as unknown as NewsListItem[] }: { initialItems?: NewsListItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"Top" | "New" | "Discussed">("Top");
  const items = useMemo(() => {
    const filtered = initialItems.filter((item) => !query || JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
    if (sort === "Top") return [...filtered].sort((a, b) => b.votes - a.votes);
    if (sort === "Discussed") return [...filtered].sort((a, b) => b.comments - a.comments);
    return filtered;
  }, [initialItems, query, sort]);
  return <><PageHeader eyebrow="WORKSPACE / SIGNAL" title="News" description="Standards updates, vendor news, cybersecurity advisories, and useful industry signal. No hot takes." /><ListToolbar value={query} onChange={setQuery} label="Filter industry news" placeholder="Filter this list…" end={<div className="segmented" aria-label="Sort news">{(["Top", "New", "Discussed"] as const).map((option) => <button type="button" className={sort === option ? "active" : ""} aria-pressed={sort === option} onClick={() => setSort(option)} key={option}>{option}</button>)}</div>} /><div className="dense-list bordered">{items.map((item) => <DenseRow key={item.slug} href={`/news/${item.slug}`} meta={`${item.source} · ${item.age}`} title={item.title} summary={item.summary} tags={item.tags} end={<span>{item.votes} ↑ · {item.comments} replies</span>} />)}</div>{items.length === 0 && <EmptyState label="No results">Try another filter or sort.</EmptyState>}</>;
}

export function WikiView({ initialItems = FALLBACK_WIKI as unknown as WikiListItem[] }: { initialItems?: WikiListItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...Array.from(new Set(initialItems.map((item) => item.category)))], [initialItems]);
  const items = initialItems.filter((item) => (category === "All" || item.category === category) && (!query || JSON.stringify(item).toLowerCase().includes(query.toLowerCase())));
  return <><PageHeader eyebrow="KNOWLEDGE / WIKI" title="Wiki" description="Source-backed field guides, explainers, troubleshooting, and documentation for working BAS practitioners." actions={<AuthAction label="Suggest an article" action="suggest a Wiki article" href="/wiki/contribute" />} /><ListToolbar value={query} onChange={setQuery} label="Filter Wiki articles" placeholder="Filter articles…" end={<div className="filter-pills" aria-label="Filter Wiki by category">{categories.map((option) => <button type="button" className={category === option ? "active" : ""} aria-pressed={category === option} onClick={() => setCategory(option)} key={option}>{option}</button>)}</div>} /><div className="dense-list bordered">{items.map((item) => <DenseRow key={item.slug} href={`/wiki/${item.slug}`} meta={item.category} title={item.title} summary={item.summary} end={item.updated} />)}</div>{items.length === 0 && <EmptyState label="No results">Try another filter or category.</EmptyState>}</>;
}

export function CoursesView() {
  return <><PageHeader eyebrow="KNOWLEDGE / COURSES · 1 AVAILABLE" title="Courses" description="One complete starting course for the building automation field—not a collection of disconnected lessons." /><section className="course-feature"><div><Pill tone="success">Available now</Pill><h2>{INTRO_TO_BAS.title}</h2><p>{INTRO_TO_BAS.description}</p><div><span>{INTRO_TO_BAS.lessons.length} lessons</span><span>{INTRO_TO_BAS_MINUTES} min</span><span>Free</span></div><Link className="button primary" href={`/courses/${INTRO_TO_BAS.slug}`}>Open course <ArrowRight size={15} /></Link></div><ol>{INTRO_TO_BAS.lessons.slice(0, 6).map((lesson) => <li key={lesson.slug}><span>{String(lesson.order).padStart(2, "0")}</span>{lesson.title}</li>)}</ol></section></>;
}

export function CourseDetailView({ completedLessons = [], signedIn = false }: { completedLessons?: string[]; signedIn?: boolean }) {
  const auth = useAuth();
  const completed = new Set(completedLessons);
  const progress = Math.round((completed.size / INTRO_TO_BAS.lessons.length) * 100);
  return <><RecentViewTracker kind="course" entityId={INTRO_TO_BAS.slug} title={INTRO_TO_BAS.title} href={`/courses/${INTRO_TO_BAS.slug}`} /><PageHeader eyebrow="COURSES / ONE COURSE" title={INTRO_TO_BAS.title} description={INTRO_TO_BAS.tagline} actions={<SaveButton kind="course" entityId={INTRO_TO_BAS.slug} title={INTRO_TO_BAS.title} href={`/courses/${INTRO_TO_BAS.slug}`} />} /><div className="course-layout"><aside><span className="eyebrow">COURSE PROGRESS</span><strong>{auth.user || signedIn ? `${completed.size} / ${INTRO_TO_BAS.lessons.length}` : "Sign in to track"}</strong><div className="progress"><i style={{ width: `${progress}%` }} /></div><p>{INTRO_TO_BAS_MINUTES} minutes across one ten-lesson sequence. Progress is account-backed when signed in.</p></aside><section className="lesson-list">{INTRO_TO_BAS.lessons.map((lesson) => <Link key={lesson.slug} href={`/courses/${INTRO_TO_BAS.slug}/${lesson.slug}`}><span>{completed.has(lesson.slug) ? "✓" : String(lesson.order).padStart(2, "0")}</span><strong>{lesson.title}</strong><small>{lesson.estimatedMinutes} min</small><ArrowRight size={14} /></Link>)}</section></div></>;
}

export function PointStackView({ mode = "feed", initialPosts, initialPeople, initialJobs, initialCompanies }: { mode?: "feed" | "questions" | "projects" | "people" | "companies" | "jobs" | "messages" | "notifications"; initialPosts?: PointStackListItem[]; initialPeople?: PointStackPersonItem[]; initialJobs?: PointStackJobItem[]; initialCompanies?: PointStackCompanyItem[] }) {
  const auth = useAuth();
  const label = mode === "feed" ? "PointStack Social" : mode[0].toUpperCase() + mode.slice(1);
  const descriptions: Record<string, string> = { feed: "A quiet place to talk shop with people who actually know building automation.", questions: "Specific BAS questions, answered by people who work on the systems.", projects: "Field work, open projects, and the lessons worth sharing.", people: "Practitioners across controls, integration, commissioning, and engineering.", companies: "Companies represented by the people participating in PointStack.", jobs: "Controls, integration, commissioning, and adjacent roles.", messages: "Private conversations with people in the BASidekick network.", notifications: "Replies, mentions, follows, and activity tied to your account." };
  if ((mode === "messages" || mode === "notifications") && !auth.user) return <><PageHeader eyebrow="POINTSTACK / ACCOUNT" title={label} description={descriptions[mode]} /><EmptyState label="SIGN IN REQUIRED">Sign in to see your {mode}.</EmptyState><button className="button primary" onClick={() => auth.requestSignIn(`view your ${mode}`)}>Sign in</button></>;
  const createHref = mode === "jobs" ? "/pointstack/jobs/new" : `/pointstack/new?type=${mode === "questions" ? "question" : mode === "projects" ? "project" : "discussion"}`;
  return <><PageHeader eyebrow="POINTSTACK / SOCIAL" title={label} description={descriptions[mode]} actions={!["people", "companies", "messages", "notifications"].includes(mode) ? <AuthAction label={mode === "jobs" ? "Post a job" : "Create post"} action={mode === "jobs" ? "post a job" : "create a PointStack post"} href={createHref} /> : undefined} />{mode === "projects" ? <Projects items={initialPosts} /> : mode === "companies" ? <Companies items={initialCompanies} /> : mode === "people" ? <People items={initialPeople} /> : mode === "jobs" ? <Jobs items={initialJobs} /> : mode === "messages" || mode === "notifications" ? <EmptyState label="ALL CAUGHT UP">No {mode} yet.</EmptyState> : <PostFeed questionsOnly={mode === "questions"} items={initialPosts} />}</>;
}

function PostFeed({ questionsOnly = false, items }: { questionsOnly?: boolean; items?: PointStackListItem[] }) {
  const [view, setView] = useState<"Recent" | "Top" | "Unanswered">("Recent");
  const [topic, setTopic] = useState("All topics");
  const source = items?.length ? items : FALLBACK_POSTS;
  const posts = useMemo(() => {
    let filtered = questionsOnly ? source.filter((post) => post.kind.toLowerCase() === "question") : source;
    if (topic !== "All topics") filtered = filtered.filter((post) => post.tags.some((tag) => tag.toLowerCase().includes(topic.toLowerCase())));
    if (view === "Unanswered") filtered = filtered.filter((post) => Number.parseInt(post.meta, 10) === 0);
    if (view === "Top") filtered = [...filtered].sort((a, b) => Number.parseInt(b.meta, 10) - Number.parseInt(a.meta, 10));
    return filtered;
  }, [questionsOnly, source, topic, view]);
  const topics = ["All topics", "BACnet", "Niagara", "Sequences", "Commissioning"];
  return <div className="pointstack-layout"><aside className="filter-rail"><strong>View</strong>{(["Recent", "Top", "Unanswered"] as const).map((option) => <button type="button" className={view === option ? "active" : ""} aria-pressed={view === option} onClick={() => setView(option)} key={option}>{option}</button>)}<strong className="spaced">Topics</strong>{topics.map((option) => <button type="button" className={topic === option ? "active" : ""} aria-pressed={topic === option} onClick={() => setTopic(option)} key={option}>{option}</button>)}</aside><div>{posts.length > 0 ? <div className="dense-list bordered">{posts.map((post) => <DenseRow key={post.slug} href={`/pointstack/posts/${post.slug}`} meta={post.kind} title={post.title} summary={`by ${post.author}`} tags={post.tags} end={post.meta} />)}</div> : <EmptyState label="No matching posts">Try another view or topic.</EmptyState>}</div></div>;
}

function Projects({ items }: { items?: PointStackListItem[] }) { if (items?.length) return <div className="dense-list bordered">{items.map((project) => <DenseRow key={project.slug} href={`/pointstack/projects/${project.slug}`} meta={project.kind} title={project.title} summary={`by ${project.author}`} tags={project.tags} end={project.meta} />)}</div>; return <div className="dense-list bordered">{projects.map((project) => <DenseRow key={project.slug} href={`/pointstack/projects/${project.slug}`} meta={project.status} title={project.title} summary={project.summary} tags={project.tags} end={project.owner} />)}</div>; }
function Companies({ items }: { items?: PointStackCompanyItem[] }) { if (items?.length) return <div className="directory-grid">{items.map((company) => <Link href={`/pointstack/companies/${company.slug}`} key={company.slug}><i className="crimson" /><Buildings size={20} /><strong>{company.name}</strong><p>{company.description}</p><span>{company.location} · {company.industry}{company.verified ? " · Verified" : ""}</span></Link>)}</div>; return <div className="directory-grid">{companies.map((company) => <Link href={`/pointstack/companies/${company.slug}`} key={company.slug}><i style={{ background: company.accent }} /><Buildings size={20} /><strong>{company.name}</strong><p>{company.tagline}</p><span>{company.members.length} member{company.members.length === 1 ? "" : "s"}</span></Link>)}</div>; }
function People({ items }: { items?: PointStackPersonItem[] }) { if (items?.length) return <div className="directory-grid">{items.map((person) => <Link href={`/pointstack/people/${person.username}`} key={person.username}><i className="crimson" /><Users size={20} /><strong>{person.name}</strong><p>{person.headline}</p><span>{person.location}{person.verified ? " · Verified" : ""}</span></Link>)}</div>; return <div className="directory-grid"><Link href="/pointstack/people/rob"><i className="crimson" /><Users size={20} /><strong>Rob</strong><p>BAS practitioner, product builder, and BASidekick maintainer.</p><span>Tucson · Founder</span></Link><div className="empty-card"><span className="eyebrow">DIRECTORY</span><p>Profiles appear here as the PointStack network grows.</p></div></div>; }
function Jobs({ items }: { items?: PointStackJobItem[] }) { const jobs = items?.length ? items : [{ slug: "controls-engineer", meta: "Controls · Full time", title: "Controls Engineer", summary: "Design, program, commission, and support BAS projects.", tags: ["Hybrid", "Niagara"], end: "External apply" }, { slug: "commissioning-specialist", meta: "Commissioning · Full time", title: "Commissioning Specialist", summary: "Functional testing, issue resolution, and controls coordination.", tags: ["Travel", "FDD"], end: "External apply" }]; return <div className="dense-list bordered">{jobs.map((job) => <DenseRow key={job.slug} href={`/pointstack/jobs/${job.slug}`} meta={job.meta} title={job.title} summary={job.summary} tags={job.tags} end={job.end} />)}</div>; }

export function ToolsView() {
  return <><PageHeader eyebrow="WORKSPACE / TOOLS" title="Tools" description="Engineering calculators, quick references, and a practical Library of software, files, and external resources." /><div className="tool-card-grid">{TOOL_CARDS.map((item) => { const Icon = item.icon; return <Link href={item.href} key={item.title}><Icon size={23} /><small>{item.meta}</small><h2>{item.title}</h2><p>{item.description}</p><em>Open <ArrowRight size={14} /></em></Link>; })}</div></>;
}

export function AtlasView() {
  return <><PageHeader eyebrow="ATLAS / STATUS" title="Returning soon" description="Atlas is being rebuilt as a new point, equipment, brand, model, and alias workspace." /><section className="atlas-status"><div className="atlas-map"><span>POINTS</span><span>EQUIPMENT</span><span>BRANDS</span><span>ALIASES</span><i /></div><div><Pill tone="warning">Being rebuilt</Pill><h2>A different Atlas is taking shape.</h2><p>The retired interface and API structure are not being treated as constraints. The replacement will return with a revised data model, clearer relationships, and search designed around how BAS practitioners actually look things up.</p></div></section><section className="milestones"><SectionTitle index="01" title="Rebuild direction" /><div><span><CheckCircle size={18} /><b>Rethink the structure</b><small>Retire assumptions that no longer fit.</small></span><span><i>02</i><b>Clarify relationships</b><small>Points, equipment, brands, and models.</small></span><span><i>03</i><b>Return search-first</b><small>Aliases and standards in one workspace.</small></span></div></section></>;
}

function AuthAction({ label, action, href }: { label: string; action: string; href?: string }) {
  const auth = useAuth();
  if (auth.user && href) return <Link className="button primary" href={href}><Plus size={15} />{label}</Link>;
  return <button className="button primary" type="button" onClick={() => auth.requestSignIn(action, href)}><Plus size={15} />{label}</button>;
}

export function RecordDetail({ section, title, summary, body, meta = [], engagement, save, primaryAction }: { section: string; title: string; summary: string; body?: string; meta?: string[]; engagement?: { kind: "pointstack" | "library"; entityId: string }; save?: { kind: PersonalizationKind; entityId: string; href?: string }; primaryAction?: { href: string; label: string; external?: boolean } }) {
  const backHref = section === "Legal" ? "/dashboard" : `/${section.toLowerCase().replace("pointstack social", "pointstack")}`;
  const personalization = save ?? (engagement ? { kind: engagement.kind, entityId: engagement.entityId } : null);
  return <article className="record-detail">{personalization && <RecentViewTracker kind={personalization.kind} entityId={personalization.entityId} title={title} href={personalization.href} />}<header><Link href={backHref}>← Back to {section === "Legal" ? "workspace" : section}</Link><span className="eyebrow">{section.toUpperCase()} / DETAIL</span><h1>{title}</h1><p>{summary}</p><div>{meta.map((item) => <Pill key={item}>{item}</Pill>)}</div></header><div className="record-layout"><section><h2>Overview</h2><p className="pre-line">{body ?? summary}</p>{section !== "Legal" && <><h2>Field notes</h2><p>This entry is part of the public BASidekick workspace. Details stay compact, source-aware, and structured for people who need the answer more than the presentation.</p></>}</section>{section !== "Legal" && <aside><span className="eyebrow">ACTIONS</span>{primaryAction && <a className="record-action primary-action" href={primaryAction.href} target={primaryAction.external ? "_blank" : undefined} rel={primaryAction.external ? "noreferrer" : undefined}>{primaryAction.label}<ArrowRight size={15} /></a>}{personalization && <SaveButton kind={personalization.kind} entityId={personalization.entityId} title={title} href={personalization.href} />}{engagement && <button type="button" onClick={() => document.getElementById("discussion")?.scrollIntoView({ behavior: "smooth" })}><ChatCircle size={16} /> Discuss</button>}</aside>}</div>{engagement && <EngagementPanel {...engagement} title={title} />}</article>;
}
