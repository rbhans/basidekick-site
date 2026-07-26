// Static Projects directory. There is no projects table yet, so this holds a
// single example entry until a data source exists (mirrors the curated
// Community Share pattern).

export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: "Active" | "Planned" | "Archived";
  tags: string[];
  owner: string;
}

export const projects: Project[] = [
  {
    slug: "example-vav-optimization",
    title: "VAV Optimization at a Downtown Office Tower",
    summary:
      "Example project — trim & respond static pressure reset and supply-air temperature reset across 40 VAV boxes.",
    description:
      "An example project entry showing how field work is shared on PointStack. Implemented ASHRAE Guideline 36 trim-and-respond logic to reset duct static pressure and supply-air temperature from zone demand, cutting fan energy while holding comfort.",
    status: "Active",
    tags: ["Example", "VAV", "Energy Optimization", "Guideline 36"],
    owner: "Rob",
  },
];
