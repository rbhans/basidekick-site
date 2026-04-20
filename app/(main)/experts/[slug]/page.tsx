import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/routes";
import {
  EndorsementTopic,
  LeaderboardEntry,
  tierFor,
} from "@/lib/schemas/endorsements";
import { UserAvatar } from "@/components/pointstack/shared/user-avatar";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadTopic(slug: string): Promise<EndorsementTopic | null> {
  const supabase = await getClient();
  const { data } = await supabase
    .from("endorsement_topics")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return (data as EndorsementTopic | null) ?? null;
}

async function loadLeaderboard(
  topicId: string,
  limit = 50
): Promise<LeaderboardEntry[]> {
  const supabase = await getClient();
  const { data } = await supabase
    .from("endorsement_scores")
    .select(
      `
      score,
      user_id,
      profiles:profiles!endorsement_scores_user_id_fkey (
        display_name,
        avatar_url,
        headline
      )
    `
    )
    .eq("topic_id", topicId)
    .gt("score", 0)
    .order("score", { ascending: false })
    .limit(limit);

  return ((data ?? []) as Array<{
    score: number;
    user_id: string;
    profiles: {
      display_name: string | null;
      avatar_url: string | null;
      headline: string | null;
    } | null;
  }>).map((row) => ({
    user_id: row.user_id,
    display_name: row.profiles?.display_name ?? null,
    avatar_url: row.profiles?.avatar_url ?? null,
    headline: row.profiles?.headline ?? null,
    score: row.score,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await loadTopic(slug);
  if (!topic) return { title: "Topic not found — BASidekick" };
  return {
    title: `${topic.name} experts — BASidekick`,
    description:
      topic.description ?? `Top ${topic.name} contributors by peer endorsements.`,
  };
}

export default async function TopicLeaderboardPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = await loadTopic(slug);
  if (!topic) notFound();

  const entries = await loadLeaderboard(topic.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link href={ROUTES.EXPERTS} className="hover:text-accent">
          ← All topics
        </Link>
      </nav>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{topic.name}</h1>
        {topic.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {topic.description}
          </p>
        )}
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No endorsed members yet. Be the first to endorse someone.
        </p>
      ) : (
        <ol className="divide-y divide-border border border-border rounded-sm bg-card">
          {entries.map((entry, idx) => {
            const tier = tierFor(entry.score);
            const displayName = entry.display_name ?? "Anonymous";
            return (
              <li key={entry.user_id} className="flex items-center gap-3 px-4 py-3">
                <span className="font-mono text-xs tabular-nums text-muted-foreground w-6 text-right">
                  {idx + 1}
                </span>
                <UserAvatar
                  displayName={displayName}
                  avatarUrl={entry.avatar_url}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  {entry.display_name ? (
                    <Link
                      href={ROUTES.POINTSTACK_PROFILE(entry.display_name)}
                      className="font-medium text-sm text-foreground hover:text-accent transition-colors"
                    >
                      {displayName}
                    </Link>
                  ) : (
                    <span className="font-medium text-sm text-foreground">
                      {displayName}
                    </span>
                  )}
                  {entry.headline && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {entry.headline}
                    </p>
                  )}
                </div>
                {tier && (
                  <span className="font-mono text-[9px] uppercase tracking-[1.1px] text-accent border border-accent/40 bg-accent/5 px-1.5 py-0.5 rounded-sm">
                    {tier.label}
                  </span>
                )}
                <span className="font-mono text-sm tabular-nums text-foreground w-10 text-right">
                  {entry.score}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
