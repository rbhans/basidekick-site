import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WikiContributionForm } from "@/components/wiki/wiki-contribution-form";
import type { WikiCategory } from "@/lib/types";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

interface SuggestEditPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: "Suggest an edit — BASidekick wiki",
  description: "Suggest changes to a BASidekick wiki article for admin review.",
};

export default async function SuggestEditPage({ params }: SuggestEditPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(ROUTES.SIGNIN);
  }

  const { data: article } = await supabase
    .from("wiki_articles")
    .select("id, title, slug, summary, content, category_id")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!article) {
    notFound();
  }

  const { data: categoriesRaw } = await supabase
    .from("wiki_categories")
    .select("id, parent_id, name, slug, description, icon_name, display_order, created_at")
    .order("display_order")
    .order("name");

  const categories = (categoriesRaw || []) as WikiCategory[];

  return (
    <div className="min-h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 pt-8 max-w-[880px]">
        <Link
          href={ROUTES.WIKI_ARTICLE(article.slug)}
          className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to article
        </Link>

        <div className="pb-5 border-b border-foreground mt-6 mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
            Wiki / Suggest edit
          </div>
          <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground">
            Suggest an edit
          </h1>
          <p className="italic text-[15px] text-muted-foreground mt-2">
            Editing <strong className="not-italic text-foreground">{article.title}</strong>. Your
            changes will go to an admin for review.
          </p>
        </div>

        <WikiContributionForm
          type="edit"
          categories={categories}
          targetArticleId={article.id}
          targetArticleSlug={article.slug}
          initialValues={{
            title: article.title,
            summary: article.summary ?? "",
            content: article.content ?? "",
            category_id: article.category_id,
          }}
        />
      </div>
    </div>
  );
}
