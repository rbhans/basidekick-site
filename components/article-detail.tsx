"use client";

import Link from "next/link";
import { ArrowSquareOut, ChatCircle } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { EngagementPanel } from "@/components/engagement-panel";
import { RecentViewTracker, SaveButton } from "@/components/personalization";
import { Pill } from "@/components/ui";

export function ArticleDetail({ backHref, backLabel, section, title, summary, body, meta, sourceUrl, engagement }: { backHref: string; backLabel: string; section: string; title: string; summary: string; body: string; meta: string[]; sourceUrl?: string; engagement?: { kind: "news" | "wiki"; entityId: string } }) {
  const kind = section.toLowerCase() === "news" ? "news" : "wiki";
  const entityId = engagement?.entityId ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <article className="record-detail"><RecentViewTracker kind={kind} entityId={entityId} title={title} /><header><Link href={backHref}>← Back to {backLabel}</Link><span className="eyebrow">{section.toUpperCase()} / DETAIL</span><h1>{title}</h1><p>{summary}</p><div className="tag-list">{meta.map((item) => <Pill key={item}>{item}</Pill>)}</div></header><div className="record-layout"><section className="article-body"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{body}</ReactMarkdown></section><aside><span className="eyebrow">ACTIONS</span>{sourceUrl && <a className="record-action" href={sourceUrl} target="_blank" rel="noreferrer"><ArrowSquareOut size={16} /> Original source</a>}<SaveButton kind={kind} entityId={entityId} title={title} /><button type="button" onClick={() => document.getElementById("discussion")?.scrollIntoView({ behavior: "smooth" })}><ChatCircle size={16} /> Discuss</button></aside></div>{engagement && <EngagementPanel {...engagement} title={title} />}</article>;
}
