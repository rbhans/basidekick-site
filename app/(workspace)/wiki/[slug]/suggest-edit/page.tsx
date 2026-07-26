import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { WikiEditSuggestionForm } from "@/components/contribution-forms";
import { createServerReadClient } from "@/lib/supabase/server";
import { fetchWikiArticleBySlug } from "@/lib/wiki-api";

export const metadata: Metadata = { title: "Suggest a Wiki edit", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SuggestWikiEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const client = await createServerReadClient();
  const { data } = client ? await client.auth.getUser() : { data: { user: null } };
  if (!data.user) redirect(`/signin?redirect=${encodeURIComponent(`/wiki/${slug}/suggest-edit`)}`);
  const article = await fetchWikiArticleBySlug(client, slug);
  if (!article) notFound();
  return <WikiEditSuggestionForm userId={data.user.id} articleId={article.id} articleTitle={article.title} initialSummary={article.summary ?? ""} initialContent={article.content} />;
}
