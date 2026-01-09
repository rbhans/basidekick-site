import { VIEW_IDS } from "./types";

// Route constants for all pages
export const ROUTES = {
  HOME: "/",
  TOOLS: "/tools",
  TOOL: (id: string) => `/tools/${id}`,
  WIKI: "/wiki",
  WIKI_ARTICLE: (slug: string) => `/wiki/${slug}`,
  WIKI_TAG: (tagSlug: string) => `/wiki/tags/${tagSlug}`,
  FORUM: "/forum",
  FORUM_CATEGORY: (categorySlug: string) => `/forum/${categorySlug}`,
  FORUM_THREAD: (categorySlug: string, threadSlug: string) =>
    `/forum/${categorySlug}/${threadSlug}`,
  RESOURCES: "/resources",
  BABEL: "/babel",
  BABEL_ENTRY: (id: string) => `/babel/${id}`,
  REFERENCES: "/references",
  CALCULATORS: "/calculators",
  ACCOUNT: "/account",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  PSK: "/psk",
  PSK_PROJECT: (id: string) => `/psk/projects/${id}`,
  PSK_CLIENT: (id: string) => `/psk/clients/${id}`,
  PSK_JOIN: (inviteCode: string) => `/psk/join/${inviteCode}`,
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
    case VIEW_IDS.RESOURCES:
      return ROUTES.RESOURCES;
    case VIEW_IDS.BABEL:
      return ROUTES.BABEL;
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
  if (pathname === "/resources") return VIEW_IDS.RESOURCES;
  if (pathname === "/babel") return VIEW_IDS.BABEL;
  if (pathname.startsWith("/babel/")) return VIEW_IDS.BABEL;
  if (pathname === "/references") return VIEW_IDS.REFERENCES;
  if (pathname === "/calculators") return VIEW_IDS.CALCULATORS;
  if (pathname === "/account") return VIEW_IDS.ACCOUNT;
  if (pathname === "/signin") return VIEW_IDS.SIGNIN;
  if (pathname === "/signup") return VIEW_IDS.SIGNUP;
  if (pathname === "/psk") return VIEW_IDS.PSK;
  if (pathname.startsWith("/psk/")) return VIEW_IDS.PSK;

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
