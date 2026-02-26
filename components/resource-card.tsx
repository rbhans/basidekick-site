import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ResourceCard({ title, description, href, icon, className }: ResourceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all",
        className
      )}
    >
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-heading text-[16px] font-bold text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-primary group-hover:underline underline-offset-4">
        Open
        <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}
