import { DenseRow, EmptyState, PageHeader, Pill } from "@/components/ui";
import type { WikiArticle } from "@/lib/types";

export function WikiRouteView({ eyebrow, title, description, articles }: { eyebrow: string; title: string; description: string; articles: WikiArticle[] }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      {articles.length ? <div className="dense-list bordered">{articles.map((article) => <DenseRow key={article.id} href={`/wiki/${article.slug}`} meta={article.category?.name ?? "Wiki"} title={article.title} summary={article.summary ?? "Open the complete field article."} tags={(article.facets ?? []).slice(0, 4).map((facet) => facet.name)} end={<Pill>{new Date(article.updated_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</Pill>} />)}</div> : <EmptyState label="NO ARTICLES">No published Wiki articles currently match this section.</EmptyState>}
    </>
  );
}
