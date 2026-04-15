import Link from "next/link";
import type { Metadata } from "next";

import { getClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/routes";
import { EndorsementTopic } from "@/lib/schemas/endorsements";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Experts · Basidekick",
  description:
    "Browse BAS experts ranked by peer endorsements across Niagara, BACnet, Metasys, and more.",
};

interface TopicWithCount extends EndorsementTopic {
  endorsed_user_count: number;
}

async function loadTopics(): Promise<TopicWithCount[]> {
  const supabase = await getClient();

  const { data: topics, error } = await supabase
    .from("endorsement_topics")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !topics) return [];

  // Count users with score > 0 per topic.
  const { data: scoreRows } = await supabase
    .from("endorsement_scores")
    .select("topic_id, score")
    .gt("score", 0);

  const countByTopic = new Map<string, number>();
  for (const row of (scoreRows ?? []) as Array<{ topic_id: string }>) {
    countByTopic.set(row.topic_id, (countByTopic.get(row.topic_id) ?? 0) + 1);
  }

  return (topics as EndorsementTopic[]).map((t) => ({
    ...t,
    endorsed_user_count: countByTopic.get(t.id) ?? 0,
  }));
}

export default async function ExpertsIndexPage() {
  const topics = await loadTopics();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Experts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Peer-endorsed expertise by topic. Endorse someone from their profile
          to add to their score.
        </p>
      </header>

      {topics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No topics yet.</p>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-sm bg-card">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link
                href={ROUTES.EXPERTS_TOPIC(topic.slug)}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-mono text-[11px] uppercase tracking-[1.2px] text-foreground">
                    {topic.name}
                  </div>
                  {topic.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {topic.description}
                    </p>
                  )}
                </div>
                <span className="font-mono text-xs tabular-nums text-muted-foreground shrink-0 ml-3">
                  {topic.endorsed_user_count}{" "}
                  {topic.endorsed_user_count === 1 ? "expert" : "experts"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
