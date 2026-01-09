import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  name: string;
  shortName: string;
  description: string;
  href: string;
  ctaText?: string;
  showBadge?: boolean;
}

export function ProductCard({
  name,
  shortName,
  description,
  href,
  ctaText = "Learn More",
  showBadge = true,
}: ProductCardProps) {
  return (
    <div className="group relative flex flex-col p-6 border border-border bg-card hover:border-primary/50 transition-all duration-200 card-hover-lift">
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-sm text-muted-foreground uppercase tracking-wide">
          {shortName}
        </span>
        {showBadge && <Badge variant="outline">Coming Soon</Badge>}
      </div>

      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-muted-foreground text-sm flex-grow mb-4">{description}</p>

      <div className="flex items-center justify-end mt-auto pt-4 border-t border-border">
        <Link
          href={href}
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          {ctaText} &rarr;
        </Link>
      </div>
    </div>
  );
}
