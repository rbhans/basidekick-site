// Static Community/Companies directory. There is no companies table yet, so
// these are hand-curated until a data source exists (mirrors the curated
// Community Share pattern). Members reference real PointStack profiles by name.

export interface CompanyMember {
  name: string;
  role: string;
}

export interface Company {
  slug: string;
  name: string;
  /** Brand accent (fixed hex — company brand color, used as a small dot). */
  accent: string;
  tagline: string;
  description: string;
  location?: string;
  website?: string;
  members: CompanyMember[];
}

export const companies: Company[] = [
  {
    slug: "basidekick",
    name: "BASidekick",
    accent: "#d11a36",
    tagline: "Independent building-automation reference, tools, and community.",
    description:
      "The team behind this site — an independent, vendor-neutral home for BAS reference material, free courses, engineering calculators, and the PointStack community.",
    website: "https://basidekick.com",
    members: [{ name: "Rob", role: "Founder" }],
  },
  {
    slug: "qa-graphics",
    name: "QA Graphics",
    accent: "#0e406a",
    tagline: "Graphics, dashboards, and content for building automation.",
    description:
      "A creative firm producing building-automation graphics, energy dashboards, floor-plan graphics, and 3D content for the controls industry.",
    location: "Ankeny, IA",
    website: "https://www.qagraphics.com",
    members: [{ name: "Rob", role: "Member" }],
  },
];
