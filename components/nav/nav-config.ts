import { ROUTES } from "@/lib/routes";

export type NavItem = {
  href: string;
  label: string;
  desc: string;
};

export type NavFeatured = {
  href: string;
  eyebrow: string;
  label: string;
};

export type NavGroup = {
  id: "learn" | "community" | "build";
  label: string;
  items: NavItem[];
  featured: NavFeatured;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "learn",
    label: "Learn",
    items: [
      { href: ROUTES.ATLAS, label: "Atlas", desc: "Point & equipment reference" },
      { href: ROUTES.WIKI, label: "Wiki", desc: "Long-form guides & explainers" },
      { href: ROUTES.COURSES, label: "Courses", desc: "Self-paced BAS lessons" },
      { href: ROUTES.REFERENCES, label: "References", desc: "Standards, specs, sources" },
      { href: ROUTES.CALCULATORS, label: "Calculators", desc: "Quick engineering math" },
    ],
    featured: {
      href: ROUTES.ATLAS,
      eyebrow: "Featured",
      label: "Most-aliased point in the atlas →",
    },
  },
  {
    id: "community",
    label: "Community",
    items: [
      { href: ROUTES.POINTSTACK, label: "PointStack", desc: "Q&A, projects, posts" },
      { href: ROUTES.NEWS, label: "News", desc: "Industry signal, weekly" },
      { href: ROUTES.POINTSTACK_PEOPLE, label: "Experts", desc: "Endorsed BAS practitioners" },
      { href: ROUTES.POINTSTACK_JOBS, label: "Open jobs", desc: "Roles across the industry" },
    ],
    featured: {
      href: ROUTES.POINTSTACK,
      eyebrow: "Trending",
      label: "Top discussion this week →",
    },
  },
  {
    id: "build",
    label: "Build",
    items: [
      { href: ROUTES.OPEN_SOURCE, label: "Community Share", desc: "Community BAS links, files, and projects" },
      { href: ROUTES.API_ATLAS, label: "API", desc: "JSON · no auth · stable URLs" },
    ],
    featured: {
      href: ROUTES.OPEN_SOURCE,
      eyebrow: "Latest",
      label: "Browse the community share →",
    },
  },
];
