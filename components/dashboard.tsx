"use client";

import Link from "next/link";
import { ArrowRight, BookmarkSimple, Broadcast, ChatCircle, CheckCircle, Wrench } from "@phosphor-icons/react";
import { useAuth } from "@/components/providers";
import { DenseRow, Metric, PageHeader, Pill, SectionTitle } from "@/components/ui";
import { FALLBACK_NEWS, FALLBACK_POSTS, FALLBACK_WIKI } from "@/lib/fallback-data";
import { TOOL_CARDS } from "@/lib/navigation";

export type DashboardNewsItem = { slug: string; source: string; age: string; title: string; summary: string; tags: string[]; votes: number };
export type DashboardPostItem = { slug: string; kind: string; title: string; author: string; meta: string };
export type DashboardWikiItem = { slug: string; category: string; title: string; summary: string; updated: string };

export function Dashboard({
  news = FALLBACK_NEWS,
  posts = FALLBACK_POSTS,
  wiki = FALLBACK_WIKI,
  counts,
}: {
  news?: DashboardNewsItem[];
  posts?: DashboardPostItem[];
  wiki?: DashboardWikiItem[];
  counts?: { wiki: number; library: number; courses: number };
}) {
  const auth = useAuth();
  const wikiCount = counts?.wiki ?? 446;
  const libraryCount = counts?.library ?? 5;
  const courseCount = counts?.courses ?? 1;
  return (
    <>
      <PageHeader eyebrow="WORKSPACE / DASHBOARD" title={auth.user ? "Welcome back." : "Building automation, in one place."} description={auth.user ? "Your saved work, current signal, and the fastest paths back into the workspace." : "The public BASidekick workspace. Read everything; sign in only when you want to contribute or save."} actions={!auth.user && <Link className="button primary" href="/signin">Sign in</Link>} />

      <section className="workspace-statusbar" aria-label="Workspace status">
        <span><Broadcast size={14} weight="fill" /> PUBLIC INDEX ONLINE</span>
        <span><CheckCircle size={14} weight="fill" /> SOURCES NOMINAL</span>
        <span>{wikiCount} FIELD ARTICLES</span>
        <span>ATLAS API AVAILABLE</span>
      </section>

      <section className="metric-grid">
        <Metric label="Wiki" value={String(wikiCount)} note="field articles" signal={86} />
        <Metric label="Library" value={String(libraryCount)} note="active entries" signal={58} />
        <Metric label="Courses" value={String(courseCount)} note="available course" signal={72} />
        <Metric label="Atlas" value="Soon" note="rebuild underway" signal={32} />
      </section>

      <div className="dashboard-grid">
        <section className="panel span-2">
          <SectionTitle title="Industry signal" action={<Link href="/news">All news <ArrowRight /></Link>} />
          <div className="dense-list">{news.slice(0, 3).map((item) => <DenseRow key={item.slug} href={`/news/${item.slug}`} meta={`${item.source} · ${item.age}`} title={item.title} summary={item.summary} tags={item.tags} end={<span>{item.votes} ↑</span>} />)}</div>
        </section>

        <section className="panel social-panel">
          <SectionTitle title="PointStack pulse" action={<ChatCircle size={17} />} />
          <div className="compact-feed">{posts.slice(0, 3).map((post) => <Link href={`/pointstack/posts/${post.slug}`} key={post.slug}><span className="post-avatar" aria-hidden="true">{post.author.slice(0, 2).toUpperCase()}</span><span className="post-copy"><Pill tone="accent">{post.kind}</Pill><strong>{post.title}</strong><span>by {post.author} · {post.meta}</span></span><ArrowRight className="post-route" size={14} /></Link>)}</div>
        </section>

        <section className="panel span-2">
          <SectionTitle title="Recently updated knowledge" action={<Link href="/wiki">Open Wiki <ArrowRight /></Link>} />
          <div className="dense-list">{wiki.slice(0, 3).map((item) => <DenseRow key={item.slug} href={`/wiki/${item.slug}`} meta={item.category} title={item.title} summary={item.summary} end={item.updated} />)}</div>
        </section>

        <section className="panel">
          <SectionTitle title="Tools" action={<Wrench size={17} />} />
          <div className="tool-shortcuts">{TOOL_CARDS.map((item) => { const Icon = item.icon; return <Link href={item.href} key={item.title}><Icon size={18} /><span><strong>{item.title}</strong><small>{item.meta}</small></span><ArrowRight size={14} /></Link>; })}</div>
        </section>
      </div>

      {!auth.user && <section className="signin-ribbon"><div><BookmarkSimple size={22} /><span><strong>Keep your place.</strong><small>Sign in to save articles, track course progress, and join PointStack conversations.</small></span></div><Link className="button primary" href="/signin">Create an account</Link></section>}
    </>
  );
}
