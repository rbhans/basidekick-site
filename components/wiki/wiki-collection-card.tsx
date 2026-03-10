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
      className="group block p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
    >
      <h3 className="font-heading text-[15px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {collection.name}
      </h3>
      {collection.description && (
        <p className="mt-2 text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
          {collection.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        {collection.article_count != null && (
          <span className="text-[11px] text-muted-foreground">
            {collection.article_count} {collection.article_count === 1 ? "article" : "articles"}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Browse <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  );
}
