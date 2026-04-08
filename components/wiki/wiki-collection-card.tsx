import Link from "next/link";
import { WikiCollection } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import { ArrowRight } from "@phosphor-icons/react";

interface WikiCollectionCardProps {
  collection: WikiCollection;
}

export function WikiCollectionCard({ collection }: WikiCollectionCardProps) {
  return (
    <Link
      href={ROUTES.WIKI_COLLECTION(collection.slug)}
      className="group block p-5 border border-border bg-card hover:border-foreground rounded-md transition-colors"
    >
      <h3 className="font-heading font-semibold text-[17px] leading-[1.25] text-foreground group-hover:text-accent transition-colors line-clamp-2">
        {collection.name}
      </h3>
      {collection.description && (
        <p className="mt-2 text-[13px] text-muted-foreground leading-[1.55] line-clamp-2">
          {collection.description}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between">
        {collection.article_count != null && (
          <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground tabular-nums">
            {collection.article_count} {collection.article_count === 1 ? "article" : "articles"}
          </span>
        )}
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[1.2px] text-foreground group-hover:text-accent transition-colors">
          Browse
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
