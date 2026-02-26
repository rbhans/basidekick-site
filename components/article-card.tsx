import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { getWikiCategoryColor } from "@/lib/wiki-colors";

interface ArticleCardProps {
  slug: string;
  category?: string | null;
  categorySlug?: string | null;
  title: string;
  description?: string | null;
  readTime?: string;
  accentColor?: string;
  className?: string;
}

export function ArticleCard({
  slug,
  category,
  categorySlug,
  title,
  description,
  readTime,
  accentColor,
  className,
}: ArticleCardProps) {
  const color = accentColor || getWikiCategoryColor(category, categorySlug);

  return (
    <Link
      href={ROUTES.WIKI_ARTICLE(slug)}
      className={`group block bg-[#1E1E22] border border-[#333] rounded-xl p-5 hover:border-primary/30 transition-all ${className || ""}`}
      style={{ borderLeftWidth: "3px", borderLeftColor: color }}
    >
      {category && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span
            className="font-mono text-[11px] font-bold tracking-[1.5px] uppercase"
            style={{ color }}
          >
            {category}
          </span>
        </div>
      )}
      <h3 className="font-heading text-[15px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
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
