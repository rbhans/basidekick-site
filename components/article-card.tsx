import Link from "next/link";
import { ROUTES } from "@/lib/routes";

interface ArticleCardProps {
  slug: string;
  category?: string | null;
  title: string;
  description?: string | null;
  readTime?: string;
  accentColor?: string;
  className?: string;
}

export function ArticleCard({
  slug,
  category,
  title,
  description,
  readTime,
  accentColor = "#C4F82A",
  className,
}: ArticleCardProps) {
  return (
    <Link
      href={ROUTES.WIKI_ARTICLE(slug)}
      className={`group block bg-card border border-border rounded-xl p-5 hover:border-[#3F3F46] transition-all ${className || ""}`}
      style={{ borderTopWidth: "3px", borderTopColor: accentColor }}
    >
      {category && (
        <span
          className="font-mono text-[11px] font-bold tracking-[2px] uppercase"
          style={{ color: accentColor }}
        >
          {category}
        </span>
      )}
      <h3 className="mt-2 font-heading text-[15px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-[12px] text-muted-foreground line-clamp-3 leading-relaxed">
          {description}
        </p>
      )}
      {readTime && (
        <span className="mt-3 block text-[11px] text-muted-foreground/70">
          {readTime}
        </span>
      )}
    </Link>
  );
}
