import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { ROUTES } from "@/lib/routes";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AtlasBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function AtlasBreadcrumb({ items }: AtlasBreadcrumbProps) {
  const allItems: BreadcrumbItem[] = [
    { label: "BAS Atlas", href: ROUTES.ATLAS_EQUIPMENT },
    ...items,
  ];

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mt-4 font-mono text-xs">
      {allItems.map((item, i) => {
        const isLast = i === allItems.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <CaretRight className="size-3 text-muted-foreground/60 shrink-0" />
            )}
            {isLast || !item.href ? (
              <span className="text-foreground truncate">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-violet-500 dark:hover:text-violet-400 transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
