// Top-level category colors
const PARENT_COLORS = {
  issuesSolutions: "#F59E0B",
  howToGuides: "#3B82F6",
  bestPractices: "#10B981",
  documentation: "#8B5CF6",
} as const;

// Maps category slugs (prefix) to parent colors — handles both parent and
// subcategory slugs so colors work before and after the flatten migration.
const SLUG_PREFIX_COLORS: [string, string][] = [
  ["issues-solutions", PARENT_COLORS.issuesSolutions],
  ["how-to", PARENT_COLORS.howToGuides],
  ["best-practices", PARENT_COLORS.bestPractices],
  ["basidekick-docs", PARENT_COLORS.documentation],
  ["documentation", PARENT_COLORS.documentation],
  ["docs-", PARENT_COLORS.documentation],
];

// Maps every known category name to its accent color
export const WIKI_CATEGORY_COLORS: Record<string, string> = {
  "Issues & Solutions": PARENT_COLORS.issuesSolutions,
  "How-To Guides": PARENT_COLORS.howToGuides,
  "Best Practices": PARENT_COLORS.bestPractices,
  "Documentation": PARENT_COLORS.documentation,
  "BASidekick Documentation": PARENT_COLORS.documentation,
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
