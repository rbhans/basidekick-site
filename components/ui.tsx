import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function Metric({ label, value, note, signal }: { label: string; value: string; note: string; signal?: number }) {
  return <div className="metric"><div className="metric-top"><span>{label}</span><i /></div><strong>{value}</strong><small>{note}</small>{signal !== undefined && <div className="metric-track" aria-hidden="true"><i style={{ width: `${signal}%` }} /></div>}</div>;
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "success" | "warning" }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function EmptyState({ label = "NO DATA", children }: { label?: string; children: ReactNode }) {
  return <div className="empty-state"><span className="eyebrow">{label}</span><p>{children}</p></div>;
}

export function DenseRow({ href, meta, title, summary, end, tags = [] }: { href: string; meta: string; title: string; summary?: string; end?: ReactNode; tags?: string[] }) {
  return (
    <Link href={href} className="dense-row">
      <span className="dense-meta">{meta}</span>
      <span className="dense-main"><strong>{title}</strong>{summary && <small>{summary}</small>}{tags.length > 0 && <span className="tag-list">{tags.map((tag) => <span key={tag}>{tag}</span>)}</span>}</span>
      {end && <span className="dense-end">{end}</span>}
    </Link>
  );
}

export function SectionTitle({ index, title, action }: { index?: string; title: string; action?: ReactNode }) {
  return <div className={`section-title ${index ? "indexed" : ""}`}>{index && <span>{index}</span>}<h2>{title}</h2>{action && <div>{action}</div>}</div>;
}
