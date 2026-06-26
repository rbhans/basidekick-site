"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, ChatCircle } from "@phosphor-icons/react";
import { SectionBar } from "./section-bar";
import { PointStackPost, PointStackPostType } from "@/lib/types";
import { getPointStackPostRoute } from "@/lib/routes";

const KIND_LABEL: Record<PointStackPostType, string> = {
  discussion: "Discussion",
  question: "Question",
  project: "Project",
  job: "Job",
  tip: "Tip",
};

export function ProjectsSection({ projects }: { projects: PointStackPost[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="pt-11">
      <SectionBar
        num="03"
        title="Projects showcase"
        meta={
          <>
            <b className="font-medium text-ink-2">{projects.length}</b> {projects.length === 1 ? "project" : "projects"}
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ post }: { post: PointStackPost }) {
  const href = getPointStackPostRoute(post.post_type, post.slug);
  const content = post.content || "";
  const excerpt = content.slice(0, 160);

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-md border border-[var(--sand-line)] bg-card px-5 py-4 shadow-sm transition-all hover:-translate-y-px hover:border-[var(--sand-line-2)] hover:shadow-md"
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="min-w-0 truncate font-heading text-[16px] font-semibold tracking-[-0.005em] text-ink group-hover:text-punch">
          {post.title}
        </span>
        <span className="ml-auto shrink-0 rounded-[3px] border border-[var(--sand-line-2)] px-1.5 py-[3px] font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
          {KIND_LABEL[post.post_type]}
        </span>
      </div>
      {excerpt && (
        <p className="mb-3.5 flex-1 text-[13.5px] leading-[1.55] text-ink-2">
          {excerpt}
          {content.length > 160 && "…"}
        </p>
      )}
      <div className="flex items-center gap-3.5 border-t border-[var(--sand-line)] pt-3 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-3 w-3" />
          {post.upvote_count}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ChatCircle className="h-3 w-3" />
          {post.comment_count}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-ink">
          view <ArrowUpRight className="h-3 w-3 text-punch" />
        </span>
      </div>
    </Link>
  );
}
