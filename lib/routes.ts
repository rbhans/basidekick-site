import { VIEW_IDS } from "./types";

// Route constants for all pages
export const ROUTES = {
  HOME: "/",
  TOOLS: "/tools",
  TOOL: (id: string) => `/tools/${encodeURIComponent(id)}`,
  WIKI: "/wiki",
  WIKI_ARTICLE: (slug: string) => `/wiki/${encodeURIComponent(slug)}`,
  WIKI_TAG: (tagSlug: string) => `/wiki/tags/${encodeURIComponent(tagSlug)}`,
  FORUM: "/forum",
  FORUM_CATEGORY: (categorySlug: string) => `/forum/${encodeURIComponent(categorySlug)}`,
  FORUM_THREAD: (categorySlug: string, threadSlug: string) =>
    `/forum/${encodeURIComponent(categorySlug)}/${encodeURIComponent(threadSlug)}`,
  RESOURCES: "/resources",
  BABEL: "/babel",
  EQUIPMENT: "/equipment",
  EQUIPMENT_BRAND: (brand: string) => `/equipment/${encodeURIComponent(brand)}`,
  EQUIPMENT_TYPE: (brand: string, type: string) => `/equipment/${encodeURIComponent(brand)}/${encodeURIComponent(type)}`,
  EQUIPMENT_MODEL: (brand: string, type: string, model: string) => `/equipment/${encodeURIComponent(brand)}/${encodeURIComponent(type)}/${encodeURIComponent(model)}`,
  EQUIPMENT_ADD: "/equipment/add",
  BABEL_ENTRY: (id: string) => `/babel/${encodeURIComponent(id)}`,
  REFERENCES: "/references",
  CALCULATORS: "/calculators",
  ACCOUNT: "/account",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  PSK: "/psk",
  PSK_PROJECT: (id: string) => `/psk/projects/${encodeURIComponent(id)}`,
  PSK_CLIENT: (id: string) => `/psk/clients/${encodeURIComponent(id)}`,
  PSK_JOIN: (inviteCode: string) => `/psk/join/${encodeURIComponent(inviteCode)}`,
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
  ADMIN: "/admin",
} as const;

// Map VIEW_ID to route path
export function getRouteForViewId(viewId: string): string {
  switch (viewId) {
    case VIEW_IDS.HOME:
      return ROUTES.HOME;
    case VIEW_IDS.TOOLS:
      return ROUTES.TOOLS;
    case VIEW_IDS.NSK:
      return ROUTES.TOOL("nsk");
    case VIEW_IDS.SSK:
      return ROUTES.TOOL("ssk");
    case VIEW_IDS.MSK:
      return ROUTES.TOOL("msk");
    case VIEW_IDS.QSK:
      return ROUTES.TOOL("qsk");
    case VIEW_IDS.WIKI:
      return ROUTES.WIKI;
    case VIEW_IDS.FORUM:
      return ROUTES.FORUM;
    case VIEW_IDS.POINTSTACK:
      return ROUTES.POINTSTACK;
    case VIEW_IDS.RESOURCES:
      return ROUTES.RESOURCES;
    case VIEW_IDS.BABEL:
      return ROUTES.BABEL;
    case VIEW_IDS.EQUIPMENT:
      return ROUTES.EQUIPMENT;
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
    case VIEW_IDS.PSK:
      return ROUTES.PSK;
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
  if (pathname === "/forum") return VIEW_IDS.FORUM;
  if (pathname === "/pointstack") return VIEW_IDS.POINTSTACK;
  if (pathname === "/resources") return VIEW_IDS.RESOURCES;
  if (pathname === "/babel") return VIEW_IDS.BABEL;
  if (pathname.startsWith("/babel/")) return VIEW_IDS.BABEL;
  if (pathname === "/equipment") return VIEW_IDS.EQUIPMENT;
  if (pathname.startsWith("/equipment/")) return VIEW_IDS.EQUIPMENT;
  if (pathname === "/references") return VIEW_IDS.REFERENCES;
  if (pathname === "/calculators") return VIEW_IDS.CALCULATORS;
  if (pathname === "/account") return VIEW_IDS.ACCOUNT;
  if (pathname === "/signin") return VIEW_IDS.SIGNIN;
  if (pathname === "/signup") return VIEW_IDS.SIGNUP;
  if (pathname === "/psk") return VIEW_IDS.PSK;
  if (pathname.startsWith("/psk/")) return VIEW_IDS.PSK;
  if (pathname === "/admin") return VIEW_IDS.ADMIN;

  // Tool detail pages
  if (pathname.startsWith("/tools/")) {
    const toolId = pathname.split("/")[2];
    if (toolId === "nsk") return VIEW_IDS.NSK;
    if (toolId === "ssk") return VIEW_IDS.SSK;
    if (toolId === "msk") return VIEW_IDS.MSK;
    if (toolId === "qsk") return VIEW_IDS.QSK;
    return VIEW_IDS.TOOLS;
  }

  // Wiki sub-pages (articles, tags)
  if (pathname.startsWith("/wiki/")) {
    return VIEW_IDS.WIKI;
  }

  // Forum sub-pages (categories, threads)
  if (pathname.startsWith("/forum/")) {
    return VIEW_IDS.FORUM;
  }

  // PointStack sub-pages
  if (pathname.startsWith("/pointstack/")) {
    return VIEW_IDS.POINTSTACK;
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
