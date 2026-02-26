export const WIKI_CATEGORY_COLORS: Record<string, string> = {
  "Issues & Solutions": "#F59E0B",
  "How-To Guides": "#3B82F6",
  "Best Practices": "#10B981",
  "Documentation": "#8B5CF6",
};

export function getWikiCategoryColor(categoryName: string | null | undefined): string {
  if (!categoryName) return "#C4F82A";
  return WIKI_CATEGORY_COLORS[categoryName] || "#C4F82A";
}
