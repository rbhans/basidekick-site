// Wiki category accents. Adapted from basidekick-site/lib/wiki-colors.ts:
// the old CSS-var scheme (var(--wiki-*)) is replaced with the five semantic
// accent tokens (slate/ochre/plum/moss/teal) exposed as Tailwind utility
// classes in app/globals.css. Slug-prefix fallback resolution is preserved.

interface CategoryColorClasses {
  dot: string;
  text: string;
}

const CATEGORY_COLOR_CLASSES: Record<string, CategoryColorClasses> = {
  // Live top-level slug is "how-to" (the old "how-to-niagara" subcategory was
  // flattened away in the 2026-02-25 category simplification migration).
  "how-to": { dot: "bg-slate", text: "text-slate" },
  "troubleshooting": { dot: "bg-ochre", text: "text-ochre" },
  "documentation": { dot: "bg-plum", text: "text-plum" },
  "best-practices": { dot: "bg-moss", text: "text-moss" },
  "reference": { dot: "bg-teal", text: "text-teal" },
};

const FALLBACK: CategoryColorClasses = { dot: "bg-fg-3", text: "text-fg-3" };

const SLUG_PREFIX_COLORS: [string, CategoryColorClasses][] = [
  ["troubleshooting", CATEGORY_COLOR_CLASSES.troubleshooting],
  ["issues-solutions", CATEGORY_COLOR_CLASSES.troubleshooting],
  ["how-to", CATEGORY_COLOR_CLASSES["how-to"]],
  ["best-practices", CATEGORY_COLOR_CLASSES["best-practices"]],
  ["reference", CATEGORY_COLOR_CLASSES.reference],
  ["basidekick-docs", CATEGORY_COLOR_CLASSES.documentation],
  ["documentation", CATEGORY_COLOR_CLASSES.documentation],
  ["docs-", CATEGORY_COLOR_CLASSES.documentation],
];

export function getCategoryColorClasses(slug: string): CategoryColorClasses {
  if (!slug) return FALLBACK;

  if (CATEGORY_COLOR_CLASSES[slug]) {
    return CATEGORY_COLOR_CLASSES[slug];
  }

  for (const [prefix, classes] of SLUG_PREFIX_COLORS) {
    if (slug.startsWith(prefix)) return classes;
  }

  return FALLBACK;
}
