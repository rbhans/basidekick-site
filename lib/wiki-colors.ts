export const WIKI_CATEGORY_COLORS: Record<string, string> = {
  "Networking": "#C4F82A",
  "Programming": "#3B82F6",
  "Standards": "#F59E0B",
  "Commissioning": "#8B5CF6",
  "Cybersecurity": "#EF4444",
  "Troubleshooting": "#10B981",
  "Best Practices": "#F97316",
  // Fallbacks for subcategories
  "How-To Guides": "#C4F82A",
  "Field Troubleshooting": "#10B981",
  "Emerging BAS Topics": "#8B5CF6",
};

export function getWikiCategoryColor(categoryName: string | null | undefined): string {
  if (!categoryName) return "#C4F82A";
  return WIKI_CATEGORY_COLORS[categoryName] || "#C4F82A";
}
