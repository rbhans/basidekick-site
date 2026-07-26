export type SourceLink = { label: string; href: string };

export type ReferenceTableBlock = {
  kind: "table";
  title?: string;
  headers: string[];
  rows: string[][];
};

export type AbbrItem = { abbr: string; full: string; description?: string };

export type AbbrListBlock = {
  kind: "abbr";
  title?: string;
  items: AbbrItem[];
};

export type ReferenceBlock = ReferenceTableBlock | AbbrListBlock;

export type ReferenceSection = {
  num: string;
  title: string;
  blocks: ReferenceBlock[];
  /** Source-backed field note shown under the section's blocks. */
  note?: string;
  sources?: SourceLink[];
};
