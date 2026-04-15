import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react";
import { tierFor } from "@/lib/schemas/endorsements";
import { cn } from "@/lib/utils";

interface ExpertiseChipProps {
  score: number;
  topicName: string;
  topicSlug: string;
  className?: string;
}

/**
 * Byline chip showing an author's expertise tier in a given topic.
 * Returns null if score is below the lowest tier.
 */
export function ExpertiseChip({
  score,
  topicName,
  topicSlug,
  className,
}: ExpertiseChipProps) {
  const tier = tierFor(score);
  if (!tier) return null;
  return (
    <Link
      href={`/experts/${topicSlug}`}
      title={`${tier.label} in ${topicName} (${score} endorsements)`}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[1.1px] text-accent border border-accent/40 bg-accent/5 px-1.5 py-0.5 rounded-sm hover:bg-accent/10 transition-colors",
        className
      )}
    >
      <CheckCircle className="h-3 w-3" weight="fill" />
      {tier.label} · {topicName}
    </Link>
  );
}
