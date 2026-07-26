import {
  Calculator,
  Package,
  Notebook,
} from "@phosphor-icons/react";

export type NavChild = { label: string; href: string; authOnly?: boolean };
export type NavItem = {
  id: string;
  label: string;
  href: string;
  badge?: string;
  children?: NavChild[];
};

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "atlas", label: "Atlas", href: "/atlas", badge: "Soon" },
  { id: "wiki", label: "Wiki", href: "/wiki" },
  { id: "courses", label: "Courses", href: "/courses" },
  { id: "news", label: "News", href: "/news" },
  {
    id: "pointstack",
    label: "PointStack Social",
    href: "/pointstack",
    children: [
      { label: "Feed", href: "/pointstack" },
      { label: "Questions", href: "/pointstack/questions" },
      { label: "Projects", href: "/pointstack/projects" },
      { label: "People", href: "/pointstack/people" },
      { label: "Companies", href: "/pointstack/companies" },
      { label: "Jobs", href: "/pointstack/jobs" },
      { label: "Messages", href: "/pointstack/messages", authOnly: true },
      { label: "Notifications", href: "/pointstack/notifications", authOnly: true },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    href: "/tools",
    children: [
      { label: "Overview", href: "/tools" },
      { label: "Calculators", href: "/calculators" },
      { label: "References", href: "/references" },
      { label: "Library", href: "/library" },
    ],
  },
];

export function activeNav(pathname: string) {
  if (pathname === "/dashboard") return NAV_ITEMS[0];
  return NAV_ITEMS.find((item) => {
    if (item.id === "tools") {
      return ["/tools", "/calculators", "/references", "/library"].some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      );
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
}

export function breadcrumbs(pathname: string) {
  const current = activeNav(pathname);
  if (!current) return [];
  const crumbs = [{ label: current.label, href: current.href }];
  const child = current.children?.find(
    (item) => item.href !== current.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
  if (child) crumbs.push({ label: child.label, href: child.href });
  if (child && pathname !== child.href) {
    const segment = pathname.slice(child.href.length + 1).split("/")[0];
    if (segment) crumbs.push({ label: segment.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" "), href: pathname });
  }
  return crumbs;
}

export const TOOL_CARDS = [
  { title: "Calculators", href: "/calculators", icon: Calculator, meta: "Engineering math", description: "Live BAS and HVAC calculations for field checks, commissioning, and design." },
  { title: "References", href: "/references", icon: Notebook, meta: "Quick lookup", description: "Protocol tables, signals, abbreviations, and practical field references." },
  { title: "Library", href: "/library", icon: Package, meta: "Software + files", description: "Apps, modules, scripts, templates, PDFs, and useful external resources." },
];
