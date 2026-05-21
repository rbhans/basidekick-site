// Wiki category accents. Each value is a CSS var resolved against the
// supporting palette in app/globals.css. Edit the var, not the hex.
const CATEGORY_COLORS = {
  troubleshooting: "var(--wiki-troubleshooting)",
  howTo: "var(--wiki-how-to)",
  bestPractices: "var(--wiki-best-practices)",
  documentation: "var(--wiki-documentation)",
  reference: "var(--wiki-reference)",
} as const;

const FALLBACK = "var(--punch)";

const SLUG_PREFIX_COLORS: [string, string][] = [
  ["troubleshooting", CATEGORY_COLORS.troubleshooting],
  ["issues-solutions", CATEGORY_COLORS.troubleshooting],
  ["how-to", CATEGORY_COLORS.howTo],
  ["best-practices", CATEGORY_COLORS.bestPractices],
  ["reference", CATEGORY_COLORS.reference],
  ["basidekick-docs", CATEGORY_COLORS.documentation],
  ["documentation", CATEGORY_COLORS.documentation],
  ["docs-", CATEGORY_COLORS.documentation],
];

export const WIKI_CATEGORY_COLORS: Record<string, string> = {
  "Troubleshooting": CATEGORY_COLORS.troubleshooting,
  "How-To": CATEGORY_COLORS.howTo,
  "Best Practices": CATEGORY_COLORS.bestPractices,
  "Documentation": CATEGORY_COLORS.documentation,
  "Reference": CATEGORY_COLORS.reference,
  "Issues & Solutions": CATEGORY_COLORS.troubleshooting,
  "How-To Guides": CATEGORY_COLORS.howTo,
  "BASidekick Documentation": CATEGORY_COLORS.documentation,
};

export function getWikiCategoryColor(
  categoryName: string | null | undefined,
  categorySlug?: string | null,
): string {
  if (!categoryName && !categorySlug) return FALLBACK;

  if (categoryName && WIKI_CATEGORY_COLORS[categoryName]) {
    return WIKI_CATEGORY_COLORS[categoryName];
  }

  if (categorySlug) {
    for (const [prefix, color] of SLUG_PREFIX_COLORS) {
      if (categorySlug.startsWith(prefix)) return color;
    }
  }

  return FALLBACK;
}
