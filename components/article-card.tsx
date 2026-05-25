import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { getWikiCategoryColor } from "@/lib/wiki-colors";
import { HoverLift } from "@/components/motion";

interface FacetPill {
  name: string;
  slug: string;
}

interface ArticleCardProps {
  slug: string;
  category?: string | null;
  categorySlug?: string | null;
  title: string;
  description?: string | null;
  readTime?: string;
  accentColor?: string;
  className?: string;
  facets?: FacetPill[];
  updatedAt?: string;
  viewCount?: number;
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
  facets,
  updatedAt,
  viewCount,
}: ArticleCardProps) {
  const color = accentColor || getWikiCategoryColor(category, categorySlug);
  // Show up to 2 facet pills
  const displayFacets = facets?.slice(0, 2);

  return (
    <HoverLift>
    <Link
      href={ROUTES.WIKI_ARTICLE(slug)}
      className={`group block bg-card border border-border rounded-md p-5 hover:border-foreground transition-all ${className || ""}`}
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
      <h3 className="font-heading text-[15px] font-bold text-foreground group-hover:text-punch transition-colors line-clamp-2">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-[12px] text-muted-foreground line-clamp-3 leading-relaxed">
          {description}
        </p>
      )}
      {displayFacets && displayFacets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {displayFacets.map((facet) => (
            <span
              key={facet.slug}
              className="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted/50 rounded"
            >
              {facet.name}
            </span>
          ))}
        </div>
      )}
      {(readTime || updatedAt || viewCount != null) && (
        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground/70">
          {readTime && <span>{readTime}</span>}
          {updatedAt && (
            <span>
              {new Date(updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
          {viewCount != null && viewCount > 0 && (
            <span>{viewCount} views</span>
          )}
        </div>
      )}
    </Link>
    </HoverLift>
  );
}
