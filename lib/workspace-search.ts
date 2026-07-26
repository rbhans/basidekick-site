import { SECTIONS } from "@/lib/calculators";
import { curatedCommunityShareEntries } from "@/lib/data/community-share";
import { companies } from "@/lib/data/pointstack-companies";
import { projects } from "@/lib/data/pointstack-projects";
import { FALLBACK_NEWS, FALLBACK_POSTS, FALLBACK_WIKI } from "@/lib/fallback-data";
import { INTRO_TO_BAS } from "@/lib/course-data";
import { NAV_ITEMS } from "@/lib/navigation";
import { REFERENCE_SECTIONS } from "@/lib/references/data";

export type WorkspaceSearchItem = {
  label: string;
  href: string;
  kind: string;
  keywords?: string;
  featured?: boolean;
};

const navigationItems: WorkspaceSearchItem[] = NAV_ITEMS.flatMap((item) => [
  { label: item.label, href: item.href, kind: "Page", keywords: item.id, featured: true },
  ...(item.children ?? []).map((child) => ({
    label: child.label,
    href: child.href,
    kind: item.label,
    keywords: `${item.label} ${child.authOnly ? "account" : ""}`,
  })),
]);

const calculatorItems: WorkspaceSearchItem[] = SECTIONS.flatMap((section) =>
  section.calculators.map((calculator) => ({
    label: calculator.title,
    href: `/calculators#${calculator.id}`,
    kind: "Calculator",
    keywords: `${section.title} ${calculator.note ?? ""} ${calculator.inputs.map((input) => input.label).join(" ")}`,
  })),
);

const referenceItems: WorkspaceSearchItem[] = REFERENCE_SECTIONS.map((section) => ({
  label: section.title,
  href: `/references#${section.title.toLowerCase().replaceAll(" ", "-")}`,
  kind: "Reference",
  keywords: `${section.note ?? ""} ${JSON.stringify(section.blocks)}`,
}));

const contentItems: WorkspaceSearchItem[] = [
  ...FALLBACK_WIKI.map((item) => ({ label: item.title, href: `/wiki/${item.slug}`, kind: "Wiki", keywords: `${item.category} ${item.summary}` })),
  ...FALLBACK_NEWS.map((item) => ({ label: item.title, href: `/news/${item.slug}`, kind: "News", keywords: `${item.source} ${item.summary} ${item.tags.join(" ")}` })),
  ...FALLBACK_POSTS.map((item) => ({ label: item.title, href: `/pointstack/posts/${item.slug}`, kind: "PointStack", keywords: `${item.kind} ${item.author} ${item.tags.join(" ")}` })),
  ...projects.map((item) => ({ label: item.title, href: `/pointstack/projects/${item.slug}`, kind: "Project", keywords: `${item.summary} ${item.description} ${item.tags.join(" ")} ${item.owner}` })),
  ...companies.map((item) => ({ label: item.name, href: `/pointstack/companies/${item.slug}`, kind: "Company", keywords: `${item.tagline} ${item.description} ${item.location ?? ""}` })),
  ...curatedCommunityShareEntries.map((item) => ({ label: item.title, href: `/library/${item.id}`, kind: "Library", keywords: `${item.protocol} ${item.kind} ${item.summary} ${item.description} ${item.tags.join(" ")} ${item.owner}` })),
  { label: "Intro to BAS", href: "/courses/intro-to-bas", kind: "Course", keywords: "beginner building automation fundamentals lessons" },
  ...INTRO_TO_BAS.lessons.map((lesson) => ({ label: lesson.title, href: `/courses/${INTRO_TO_BAS.slug}/${lesson.slug}`, kind: "Course lesson", keywords: `${INTRO_TO_BAS.title} ${lesson.description}` })),
  { label: "Rob", href: "/pointstack/people/rob", kind: "Person", keywords: "BAS practitioner product builder BASidekick maintainer Tucson founder" },
];

export const WORKSPACE_SEARCH_ITEMS: WorkspaceSearchItem[] = Array.from(
  new Map([...navigationItems, ...calculatorItems, ...referenceItems, ...contentItems].map((item) => [`${item.href}:${item.label}`, item])).values(),
);

function normalize(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreItem(item: WorkspaceSearchItem, query: string) {
  const label = normalize(item.label);
  const kind = normalize(item.kind);
  const keywords = normalize(item.keywords ?? "");
  const haystack = `${label} ${kind} ${keywords}`;
  const tokens = query.split(" ").filter(Boolean);
  if (!tokens.every((token) => haystack.includes(token))) return -1;

  let score = 0;
  if (label === query) score += 1000;
  else if (label.startsWith(query)) score += 700;
  else if (label.includes(query)) score += 450;
  if (kind === query) score += 240;
  for (const token of tokens) {
    if (label.split(" ").some((word) => word.startsWith(token))) score += 90;
    else if (label.includes(token)) score += 55;
    else if (kind.includes(token)) score += 25;
    else score += 10;
  }
  return score;
}

export function searchWorkspace(query: string, limit = 10, additionalItems: WorkspaceSearchItem[] = []) {
  const value = normalize(query);
  if (!value) return WORKSPACE_SEARCH_ITEMS.filter((item) => item.featured).slice(0, limit);
  const items = Array.from(new Map([...additionalItems, ...WORKSPACE_SEARCH_ITEMS].map((item) => [`${item.href}:${item.label}`, item])).values());
  return items.map((item) => ({ item, score: scoreItem(item, value) }))
    .filter((result) => result.score >= 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
    .slice(0, limit)
    .map((result) => result.item);
}
