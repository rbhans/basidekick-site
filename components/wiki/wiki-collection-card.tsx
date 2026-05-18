import Link from "next/link";
import { WikiCollection } from "@/lib/types";
import { ROUTES } from "@/lib/routes";

interface WikiCollectionCardProps {
  collection: WikiCollection;
}

export function WikiCollectionCard({ collection }: WikiCollectionCardProps) {
  return (
    <Link href={ROUTES.WIKI_COLLECTION(collection.slug)} className="wk-coll">
      <span className="label">★ Collection</span>
      <h3>{collection.name}</h3>
      {collection.description && <p>{collection.description}</p>}
      <span className="foot">
        {collection.article_count != null && (
          <span>
            <b className="text-ink font-medium tabular-nums">{collection.article_count}</b>{" "}
            {collection.article_count === 1 ? "article" : "articles"}
          </span>
        )}
        <span style={{ marginLeft: "auto" }}>Browse →</span>
      </span>
    </Link>
  );
}
