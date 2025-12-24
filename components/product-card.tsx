import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  name: string;
  shortName: string;
  description: string;
  price: string;
  status: "ready" | "dev" | "coming";
  href: string;
  ctaText?: string;
}

export function ProductCard({
  name,
  shortName,
  description,
  price,
  status,
  href,
  ctaText = "Learn",
}: ProductCardProps) {
  const statusConfig = {
    ready: { label: "Ready", variant: "default" as const },
    dev: { label: "Dev", variant: "secondary" as const },
    coming: { label: "Coming Soon", variant: "outline" as const },
  };

  const statusInfo = statusConfig[status];

  return (
    <div className="group relative flex flex-col p-6 border border-border bg-card hover:border-primary/50 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-sm text-muted-foreground uppercase tracking-wide">
          {shortName}
        </span>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-muted-foreground text-sm flex-grow mb-4">{description}</p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <span className="font-mono text-lg">{price}</span>
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
