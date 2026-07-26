// Hand-curated Community Share entries.
// Ported verbatim from basidekick-site/lib/data/community-share.ts — keep every
// entry and field as-is; this is real curated content, not placeholder data.

export type CommunityShareKind = "Protocol" | "Project" | "Module" | "File";
export type CommunityShareStage = "Active" | "Preview" | "Planned";
export type CommunityShareAccess = "Open source" | "Project site" | "File" | "Paid externally" | "Planned";
export type CommunityShareLinkType = "github" | "file" | "site" | "external";

export interface CommunityShareLink {
  label: string;
  href: string;
  type?: CommunityShareLinkType;
}

export interface CommunityShareImage {
  src: string;
  alt: string;
}

export interface CommunityShareEntry {
  id: string;
  resourceId?: string;
  title: string;
  protocol: string;
  kind: CommunityShareKind;
  stage: CommunityShareStage;
  access: CommunityShareAccess;
  summary: string;
  description: string;
  owner: string;
  language: string;
  license: string;
  latest: string;
  lastCommit: string;
  stars: number | string;
  images?: CommunityShareImage[];
  highlights: string[];
  tags: string[];
  links: CommunityShareLink[];
}

// Hand-curated entries keep the directory answer-ready when Supabase is unavailable
// or before community-submitted resources have been indexed.
export const curatedCommunityShareEntries: CommunityShareEntry[] = [
  {
    id: "bask-stream",
    title: "BASk Stream",
    protocol: "Niagara 4",
    kind: "Module",
    stage: "Active",
    access: "Open source",
    summary:
      "Niagara 4 runtime module that exposes station data through an authenticated WebSocket API.",
    description:
      "BASk Stream gives external graphics, dashboards, commissioning apps, and integrations a practical live-data path without forcing every app to live inside Niagara UI.",
    owner: "BASidekick",
    language: "Java",
    license: "See repo",
    latest: "Public repo",
    lastCommit: "Verified Jun 21, 2026",
    stars: "-",
    tags: ["niagara", "websocket", "integration", "module"],
    highlights: [
      "Station browsing, object descriptions, bounded search, and metadata for points, devices, schedules, histories, and alarms.",
      "Point snapshots and replaceable live subscriptions with lease renewal and connection cleanup.",
      "Designed for external BAS graphics, dashboards, commissioning apps, and integration clients.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/rbhans/bask-stream", type: "github" },
    ],
  },
  {
    id: "rustbac",
    title: "rustbac",
    protocol: "BACnet",
    kind: "Protocol",
    stage: "Active",
    access: "Open source",
    summary:
      "Rust BACnet workspace for BACnet/IP, BACnet/SC, MS/TP, clients, servers, and CLI work.",
    description:
      "Open source Rust crates for BACnet communication in BAS applications, including a core encoder/decoder, async BACnet/IP transport, BACnet/SC transport, MS/TP transport, client APIs, server scaffolding, and CLI commands.",
    owner: "BASidekick",
    language: "Rust",
    license: "MIT OR Apache-2.0",
    latest: "Public repo",
    lastCommit: "Verified Jun 21, 2026",
    stars: "-",
    tags: ["bacnet", "rust", "protocol"],
    highlights: [
      "Core encoder/decoder coverage for BACnet NPDU/APDU, types, and service payloads.",
      "BACnet/IP, BACnet/SC, and MS/TP-oriented transport work.",
      "CLI workflow coverage for common BACnet discovery, read, write, and subscription tasks.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/rbhans/rust-bac", type: "github" },
    ],
  },
  {
    id: "rustmod",
    title: "rustmod",
    protocol: "Modbus",
    kind: "Protocol",
    stage: "Active",
    access: "Open source",
    summary:
      "Rust Modbus workspace with TCP and RTU transports, async and sync clients, and server support.",
    description:
      "Open source Rust crates for Modbus communication in BAS and industrial integrations, with no_std-oriented core work, async and sync clients, TCP and RTU transports, and server support.",
    owner: "BASidekick",
    language: "Rust",
    license: "MIT OR Apache-2.0",
    latest: "Public repo",
    lastCommit: "Verified Jun 21, 2026",
    stars: "-",
    tags: ["modbus", "rust", "protocol"],
    highlights: [
      "Modbus function coverage for coils, registers, diagnostics, file records, FIFO, and MEI-oriented workflows.",
      "Core codec work intended for safe protocol handling.",
      "Client and server pieces for TCP, RTU-over-TCP, and related BAS integration testing.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/rbhans/rust-mod", type: "github" },
    ],
  },
  {
    id: "qrbas",
    title: "QRBAS",
    protocol: "Niagara",
    kind: "Project",
    stage: "Active",
    access: "Open source",
    summary:
      "Self-hosted QR equipment pages for BAS teams, with a local Niagara connector and no cloud backend.",
    description:
      "QRBAS lets BAS teams run a small local service, add Niagara stations, print QR codes for equipment, and let technicians scan with a phone camera to see live point data in the browser.",
    owner: "BASidekick",
    language: "Go",
    license: "See repo",
    latest: "Public repo",
    lastCommit: "Verified Jun 21, 2026",
    stars: "-",
    tags: ["niagara", "qr", "field"],
    highlights: [
      "Self-hosted workflow for QR equipment pages on the BAS network.",
      "Niagara station setup, equipment mapping, and printable QR codes.",
      "No app store, cloud backend, or technician login required for the core scan workflow.",
    ],
    links: [
      { label: "GitHub", href: "https://github.com/rbhans/qrbas", type: "github" },
      { label: "Project site", href: "https://rbhans.github.io/qrbas/", type: "site" },
    ],
  },
  {
    id: "opencrate-bms",
    title: "OpenCrate BMS",
    protocol: "BMS",
    kind: "Project",
    stage: "Planned",
    access: "Project site",
    summary:
      "Hobby BMS project being built from scratch in Rust. Public release is still pending.",
    description:
      "OpenCrate BMS is a public project site for a planned Rust-native building management system, with protocol support, alarms, trends, logic, and commissioning workflows listed as project direction.",
    owner: "BASidekick",
    language: "Rust",
    license: "MIT",
    latest: "Planned",
    lastCommit: "Verified Jun 21, 2026",
    stars: "-",
    tags: ["rust", "bms", "project"],
    highlights: [
      "Planned protocol support for BACnet/IP, BACnet/SC, MS/TP, Modbus TCP, and Modbus RTU.",
      "Planned alarms, routing, trend logging, visual logic, and commissioning workflows.",
      "Useful as a public build log while the software is still forming.",
    ],
    links: [
      { label: "Project site", href: "https://rbhans.github.io/opencrate-site/", type: "site" },
    ],
  },
];
