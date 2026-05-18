import { VIEW_IDS } from "./types";

// Route constants for all pages
export const ROUTES = {
  HOME: "/",
  TOOLS: "/tools",
  TOOL: (id: string) => `/tools/${encodeURIComponent(id)}`,
  WIKI: "/wiki",
  WIKI_ARTICLE: (slug: string) => `/wiki/${encodeURIComponent(slug)}`,
  WIKI_TAG: (tagSlug: string) => `/wiki/tags/${encodeURIComponent(tagSlug)}`,
  WIKI_COLLECTION: (slug: string) => `/wiki/collections/${encodeURIComponent(slug)}`,
  WIKI_FACET: (group: string, slug: string) => `/wiki/${encodeURIComponent(group)}/${encodeURIComponent(slug)}`,
  WIKI_VIDEOS: "/wiki/videos",
  RESOURCES: "/resources",
  RESOURCES_RUST: "/resources/rust",
  OPEN_SOURCE: "/open-source",

  // Atlas unified routes
  ATLAS: "/atlas",
  ATLAS_ENTRY: (id: string) => `/atlas/${encodeURIComponent(id)}`,
  ATLAS_EQUIPMENT: "/atlas?tab=equipment",
  ATLAS_EQUIPMENT_ADD: "/atlas/equipment/add",
  ATLAS_EQUIPMENT_BRAND: (brand: string) => `/atlas/equipment/${encodeURIComponent(brand)}`,
  ATLAS_EQUIPMENT_TYPE: (brand: string, type: string) =>
    `/atlas/equipment/${encodeURIComponent(brand)}/${encodeURIComponent(type)}`,
  ATLAS_EQUIPMENT_MODEL: (brand: string, type: string, model: string) =>
    `/atlas/equipment/${encodeURIComponent(brand)}/${encodeURIComponent(type)}/${encodeURIComponent(model)}`,

  // Legacy aliases kept for compatibility in remaining references
  BABEL: "/atlas",
  BABEL_ENTRY: (id: string) => `/atlas/${encodeURIComponent(id)}`,
  EQUIPMENT: "/atlas?tab=equipment",
  EQUIPMENT_ADD: "/atlas/equipment/add",
  EQUIPMENT_BRAND: (brand: string) => `/atlas/equipment/${encodeURIComponent(brand)}`,
  EQUIPMENT_TYPE: (brand: string, type: string) =>
    `/atlas/equipment/${encodeURIComponent(brand)}/${encodeURIComponent(type)}`,
  EQUIPMENT_MODEL: (brand: string, type: string, model: string) =>
    `/atlas/equipment/${encodeURIComponent(brand)}/${encodeURIComponent(type)}/${encodeURIComponent(model)}`,

  REFERENCES: "/references",
  CALCULATORS: "/calculators",
  COURSES: "/courses",
  API_ATLAS: "/api/atlas",
  POINTSTACK_PEOPLE: "/pointstack/people",
  POINTSTACK_JOBS: "/pointstack/jobs",
  ACCOUNT: "/account",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  // PointStack Community Platform
  POINTSTACK: "/pointstack",
  POINTSTACK_PROFILE: (username: string) => `/pointstack/people/@${encodeURIComponent(username)}`,
  POINTSTACK_COMPANY: (slug: string) => `/pointstack/companies/${encodeURIComponent(slug)}`,
  POINTSTACK_PROJECT: (slug: string) => `/pointstack/projects/${encodeURIComponent(slug)}`,
  POINTSTACK_QUESTION: (slug: string) => `/pointstack/questions/${encodeURIComponent(slug)}`,
  POINTSTACK_POST: (slug: string) => `/pointstack/posts/${encodeURIComponent(slug)}`,
  POINTSTACK_JOB: (slug: string) => `/pointstack/jobs/${encodeURIComponent(slug)}`,
  POINTSTACK_RESOURCE: (slug: string) => `/pointstack/resources/${encodeURIComponent(slug)}`,
  POINTSTACK_MESSAGES: "/pointstack/messages",
  POINTSTACK_CONVERSATION: (id: string) => `/pointstack/messages/${encodeURIComponent(id)}`,
  POINTSTACK_NOTIFICATIONS: "/pointstack/notifications",
  POINTSTACK_ONBOARDING: "/pointstack/onboarding",
  // News
  NEWS: "/news",
  NEWS_ARTICLE: (slug: string) => `/news/${encodeURIComponent(slug)}`,
  ADMIN: "/admin",
  EXPERTS: "/experts",
  EXPERTS_TOPIC: (slug: string) => `/experts/${encodeURIComponent(slug)}`,
  ADMIN_ENDORSEMENT_TOPICS: "/admin/endorsement-topics",
} as const;

export function getPointStackPostRoute(postType: string, slug: string): string {
  if (postType === "job") return ROUTES.POINTSTACK_JOB(slug);
  return ROUTES.POINTSTACK_POST(slug);
}

// Map VIEW_ID to route path
export function getRouteForViewId(viewId: string): string {
  switch (viewId) {
    case VIEW_IDS.HOME:
      return ROUTES.HOME;
    case VIEW_IDS.TOOLS:
      return ROUTES.TOOLS;
    case VIEW_IDS.SSK:
      return ROUTES.TOOL("ssk");
    case VIEW_IDS.QSK:
      return ROUTES.TOOL("qsk");
    case VIEW_IDS.WIKI:
      return ROUTES.WIKI;
    case VIEW_IDS.POINTSTACK:
      return ROUTES.POINTSTACK;
    case VIEW_IDS.RESOURCES:
      return ROUTES.RESOURCES;
    case VIEW_IDS.ATLAS:
      return ROUTES.ATLAS;
    case VIEW_IDS.BABEL:
      return ROUTES.ATLAS;
    case VIEW_IDS.EQUIPMENT:
      return ROUTES.ATLAS;
    case VIEW_IDS.REFERENCES:
      return ROUTES.REFERENCES;
    case VIEW_IDS.CALCULATORS:
      return ROUTES.CALCULATORS;
    case VIEW_IDS.ACCOUNT:
      return ROUTES.ACCOUNT;
    case VIEW_IDS.SIGNIN:
      return ROUTES.SIGNIN;
    case VIEW_IDS.SIGNUP:
      return ROUTES.SIGNUP;
    case VIEW_IDS.NEWS:
      return ROUTES.NEWS;
    case VIEW_IDS.OPEN_SOURCE:
      return ROUTES.OPEN_SOURCE;
    case VIEW_IDS.ADMIN:
      return ROUTES.ADMIN;
    default:
      return ROUTES.HOME;
  }
}

// Map pathname to VIEW_ID for layout active state
export function getViewIdFromPath(pathname: string): string {
  // Exact matches first
  if (pathname === "/") return VIEW_IDS.HOME;
  if (pathname === "/tools") return VIEW_IDS.TOOLS;
  if (pathname === "/wiki") return VIEW_IDS.WIKI;
  if (pathname === "/pointstack") return VIEW_IDS.POINTSTACK;
  if (pathname === "/news") return VIEW_IDS.NEWS;
  if (pathname === "/resources") return VIEW_IDS.RESOURCES;
  if (pathname.startsWith("/resources/")) return VIEW_IDS.RESOURCES;
  if (pathname === "/open-source") return VIEW_IDS.OPEN_SOURCE;
  if (pathname.startsWith("/open-source/")) return VIEW_IDS.OPEN_SOURCE;
  if (pathname === "/atlas") return VIEW_IDS.ATLAS;
  if (pathname.startsWith("/atlas/")) return VIEW_IDS.ATLAS;
  if (pathname === "/babel") return VIEW_IDS.ATLAS;
  if (pathname.startsWith("/babel/")) return VIEW_IDS.ATLAS;
  if (pathname === "/equipment") return VIEW_IDS.ATLAS;
  if (pathname.startsWith("/equipment/")) return VIEW_IDS.ATLAS;
  if (pathname === "/references") return VIEW_IDS.REFERENCES;
  if (pathname === "/calculators") return VIEW_IDS.CALCULATORS;
  if (pathname === "/account") return VIEW_IDS.ACCOUNT;
  if (pathname === "/signin") return VIEW_IDS.SIGNIN;
  if (pathname === "/signup") return VIEW_IDS.SIGNUP;
  if (pathname === "/admin") return VIEW_IDS.ADMIN;

  // Tool detail pages
  if (pathname.startsWith("/tools/")) {
    const toolId = pathname.split("/")[2];
    if (toolId === "ssk") return VIEW_IDS.SSK;
    if (toolId === "qsk") return VIEW_IDS.QSK;
    return VIEW_IDS.TOOLS;
  }

  // Wiki sub-pages (articles, tags)
  if (pathname.startsWith("/wiki/")) {
    return VIEW_IDS.WIKI;
  }

  // PointStack sub-pages
  if (pathname.startsWith("/pointstack/")) {
    return VIEW_IDS.POINTSTACK;
  }

  // News sub-pages
  if (pathname.startsWith("/news/")) {
    return VIEW_IDS.NEWS;
  }

  // References sub-pages
  if (pathname.startsWith("/references/")) {
    return VIEW_IDS.REFERENCES;
  }

  return VIEW_IDS.HOME;
}

// Check if a pathname is a child of a VIEW_ID
// Used for nav tree expansion
export function isChildOfViewId(pathname: string, viewId: string): boolean {
  const route = getRouteForViewId(viewId);
  if (route === "/") return pathname === "/";
  return pathname.startsWith(route);
}
