// Category colors — current names + backward-compat for old names
const CATEGORY_COLORS = {
  troubleshooting: "#F59E0B",
  howTo: "#3B82F6",
  bestPractices: "#10B981",
  documentation: "#8B5CF6",
  reference: "#06B6D4",
} as const;

// Maps category slugs (prefix) to colors — handles renamed + legacy slugs.
const SLUG_PREFIX_COLORS: [string, string][] = [
  ["troubleshooting", CATEGORY_COLORS.troubleshooting],
  ["issues-solutions", CATEGORY_COLORS.troubleshooting], // legacy
  ["how-to", CATEGORY_COLORS.howTo],
  ["best-practices", CATEGORY_COLORS.bestPractices],
  ["reference", CATEGORY_COLORS.reference],
  ["basidekick-docs", CATEGORY_COLORS.documentation],
  ["documentation", CATEGORY_COLORS.documentation],
  ["docs-", CATEGORY_COLORS.documentation],
];

// Maps every known category name to its accent color
export const WIKI_CATEGORY_COLORS: Record<string, string> = {
  // Current names
  "Troubleshooting": CATEGORY_COLORS.troubleshooting,
  "How-To": CATEGORY_COLORS.howTo,
  "Best Practices": CATEGORY_COLORS.bestPractices,
  "Documentation": CATEGORY_COLORS.documentation,
  "Reference": CATEGORY_COLORS.reference,
  // Legacy names (backward-compat)
  "Issues & Solutions": CATEGORY_COLORS.troubleshooting,
  "How-To Guides": CATEGORY_COLORS.howTo,
  "BASidekick Documentation": CATEGORY_COLORS.documentation,
};

export function getWikiCategoryColor(
  categoryName: string | null | undefined,
  categorySlug?: string | null,
): string {
  if (!categoryName && !categorySlug) return "#C4F82A";

  // Try exact name match first
  if (categoryName && WIKI_CATEGORY_COLORS[categoryName]) {
    return WIKI_CATEGORY_COLORS[categoryName];
  }

  // Fall back to slug prefix matching (handles subcategories)
  if (categorySlug) {
    for (const [prefix, color] of SLUG_PREFIX_COLORS) {
      if (categorySlug.startsWith(prefix)) return color;
    }
  }

  return "#C4F82A";
}
