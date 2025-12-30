import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ForumCategoryView } from "@/components/forum/forum-category-view";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

interface ForumCategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: ForumCategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      title: "Category Not Found | basidekick Forum",
    };
  }

  const { data: category } = await supabase
    .from("forum_categories")
    .select("name, description")
    .eq("slug", categorySlug)
    .single();

  if (!category) {
    return {
      title: "Category Not Found | basidekick Forum",
    };
  }

  const description = category.description || `Discuss ${category.name} topics with the BAS community`;

  return {
    title: `${category.name} | basidekick Forum`,
    description,
    openGraph: {
      title: `${category.name} - basidekick Forum`,
      description,
      type: "website",
      siteName: "basidekick",
      url: `https://basidekick.com/forum/${categorySlug}`,
    },
    alternates: {
      canonical: `https://basidekick.com/forum/${categorySlug}`,
    },
  };
}

export default async function ForumCategoryPage({ params }: ForumCategoryPageProps) {
  const { categorySlug } = await params;
  const supabase = getSupabaseClient();

  if (!supabase) {
    notFound();
  }

  const { data: category } = await supabase
    .from("forum_categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) {
    notFound();
  }

  // Fetch threads in this category
  const { data: threads } = await supabase
    .from("forum_threads")
    .select(`
      *,
      author:profiles!forum_threads_user_id_fkey(display_name)
    `)
    .eq("category_id", category.id)
    .order("is_pinned", { ascending: false })
    .order("last_post_at", { ascending: false, nullsFirst: false });

  return <ForumCategoryView category={category} threads={threads || []} />;
}
