import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ForumThreadDetail } from "@/components/forum/forum-thread-detail";
import { escapeJsonLd } from "@/lib/security";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

interface ForumThreadPageProps {
  params: Promise<{ categorySlug: string; threadSlug: string }>;
}

export async function generateMetadata({ params }: ForumThreadPageProps): Promise<Metadata> {
  const { categorySlug, threadSlug } = await params;
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      title: "Thread Not Found | basidekick Forum",
    };
  }

  const { data: thread } = await supabase
    .from("forum_threads")
    .select(`
      id,
      title,
      author:profiles!forum_threads_author_id_fkey(display_name),
      category:forum_categories!forum_threads_category_id_fkey(name)
    `)
    .eq("slug", threadSlug)
    .single();

  if (!thread) {
    return {
      title: "Thread Not Found | basidekick Forum",
    };
  }

  // Get first post for description
  const { data: firstPost } = await supabase
    .from("forum_posts")
    .select("content")
    .eq("thread_id", thread.id)
    .order("created_at")
    .limit(1)
    .single();

  // Handle category which may be an object or array from the join
  const category = thread.category as { name?: string } | { name?: string }[] | null;
  const categoryName = Array.isArray(category)
    ? category[0]?.name
    : category?.name;

  const description = firstPost?.content?.slice(0, 160) || `Discussion in ${categoryName || "Forum"}`;

  // Handle author which may be an object or array from the join
  const author = thread.author as { display_name?: string } | { display_name?: string }[] | null;
  const authorName = Array.isArray(author) ? author[0]?.display_name : author?.display_name;

  return {
    title: `${thread.title} | basidekick Forum`,
    description,
    authors: authorName ? [{ name: authorName }] : undefined,
    openGraph: {
      title: thread.title,
      description,
      type: "article",
      siteName: "basidekick",
      url: `https://basidekick.com/forum/${categorySlug}/${threadSlug}`,
    },
    twitter: {
      card: "summary",
      title: thread.title,
      description,
    },
    alternates: {
      canonical: `https://basidekick.com/forum/${categorySlug}/${threadSlug}`,
    },
  };
}

// JSON-LD structured data for discussion forum
function generateDiscussionJsonLd(
  thread: {
    title: string;
    created_at: string;
    author?: { display_name?: string };
    view_count?: number;
    reply_count?: number;
  },
  categorySlug: string,
  threadSlug: string,
  posts: Array<{
    content: string;
    author?: { display_name?: string };
    created_at: string;
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: thread.title,
    author: {
      "@type": "Person",
      name: thread.author?.display_name || "Anonymous",
    },
    datePublished: thread.created_at,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: thread.view_count || 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: thread.reply_count || posts.length,
      },
    ],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://basidekick.com/forum/${categorySlug}/${threadSlug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "basidekick",
      url: "https://basidekick.com",
    },
    about: {
      "@type": "Thing",
      name: "Building Automation Systems",
    },
    comment: posts.slice(0, 10).map((post) => ({
      "@type": "Comment",
      author: {
        "@type": "Person",
        name: post.author?.display_name || "Anonymous",
      },
      datePublished: post.created_at,
      text: post.content.slice(0, 200),
    })),
  };
}

export default async function ForumThreadPage({ params }: ForumThreadPageProps) {
  const { categorySlug, threadSlug } = await params;
  const supabase = getSupabaseClient();

  if (!supabase) {
    notFound();
  }

  // Fetch category
  const { data: category } = await supabase
    .from("forum_categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) {
    notFound();
  }

  // Fetch thread
  const { data: thread } = await supabase
    .from("forum_threads")
    .select(`
      *,
      author:profiles!forum_threads_author_id_fkey(display_name)
    `)
    .eq("slug", threadSlug)
    .eq("category_id", category.id)
    .single();

  if (!thread) {
    notFound();
  }

  // Fetch posts
  const { data: posts } = await supabase
    .from("forum_posts")
    .select(`
      *,
      author:profiles!forum_posts_author_id_fkey(display_name)
    `)
    .eq("thread_id", thread.id)
    .order("created_at");

  const jsonLd = generateDiscussionJsonLd(thread, categorySlug, threadSlug, posts || []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(jsonLd) }}
      />
      <ForumThreadDetail thread={thread} category={category} posts={posts || []} />
    </>
  );
}
