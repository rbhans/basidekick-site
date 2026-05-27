"use client";

import { useMemo, useState } from "react";
import { GithubLogo } from "@phosphor-icons/react";

type ProjectKind = "Protocol" | "Tool" | "Module" | "BMS";

interface ProjectMeta {
  language: string;
  license: string;
  latest: string;
  stars: number | string;
  lastCommit: string;
  status: string;
}

interface ProjectLink {
  label: string;
  href: string;
}

interface FeatureNote {
  title: string;
  body: string;
}

interface Snippet {
  label: string;
  body: string;
}

interface OpenSourceProject {
  id: string;
  name: string;
  protocol: string;
  kind: ProjectKind;
  /** Short tagline. Should be true, not marketing. */
  tagline: React.ReactNode;
  /** Long description. Sourced from the live site or the project's own README. */
  description: React.ReactNode;
  githubUrl: string;
  meta: ProjectMeta;
  /** Features pulled verbatim or paraphrased from the project's README. */
  features: FeatureNote[];
  /** Real example code or config. Either copied from the repo or omitted. */
  snippets?: Snippet[];
  links: ProjectLink[];
}

// All data below is sourced from each project's GitHub README, Cargo.toml,
// local module metadata, or public site. Nothing is invented. If a field is
// unknown it shows "—". Existing repos last cross-checked: 2026-05-17.
// NiagaraFalls added from local README/module metadata and GitHub on 2026-05-26.
const openSourceProjects: OpenSourceProject[] = [
  {
    id: "rustbac",
    name: "rustbac",
    protocol: "BACnet",
    kind: "Protocol",
    tagline: (
      <>
        Rust <b>BACnet workspace</b> · BACnet/IP, BACnet/SC, MS/TP
      </>
    ),
    description: (
      <>
        Open source Rust crate for BACnet communication in BAS applications. The first protocol crate in the BASidekick Rust suite. The workspace ships a <em>no_std</em> core encoder/decoder, async BACnet/IP transport, BACnet/SC WebSocket transport, MS/TP transport, a high-level client API, server scaffolding, and a set of CLI tools.
      </>
    ),
    githubUrl: "https://github.com/rbhans/rust-bac",
    meta: {
      language: "Rust",
      license: "MIT OR Apache-2.0",
      latest: "0.4.1",
      stars: 2,
      lastCommit: "May 12, 2026",
      status: "Active",
    },
    features: [
      {
        title: "no_std core encoder/decoder",
        body: "rustbac-core handles BACnet encoding, NPDU/APDU, types, and service payloads without depending on the standard library.",
      },
      {
        title: "Multiple transports",
        body: "BACnet/IP (UDP/BVLC) with BBMD/FDR support, BACnet/SC WebSocket, and MS/TP — each in its own crate.",
      },
      {
        title: "Full BACnet service coverage",
        body: "Who-Is/I-Am, Who-Has/I-Have, Read/Write Property (single + multiple), ReadRange, Atomic Read/Write File, Subscribe COV, event/alarm services, and ConfirmedPrivateTransfer.",
      },
      {
        title: "CLI binaries",
        body: "rustbac-tools ships whois, whohas, readprop, writeprop, subcov, readrange, readfile, dcc, reinit, timesync, and more.",
      },
    ],
    snippets: [
      {
        label: "Cargo.toml",
        body: `[dependencies]\nrustbac-client = "0.4"\nrustbac-core = "0.4"\nrustbac-datalink = "0.4"`,
      },
      {
        label: "examples/discover_devices.rs",
        body: `use rustbac_client::BacnetClient;\nuse std::time::Duration;\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn std::error::Error>> {\n    let client = BacnetClient::new().await?;\n    let devices = client.who_is(\n        None,\n        Duration::from_secs(3),\n    ).await?;\n    for device in &devices {\n        println!("{:?} at {}", device.device_id, device.address);\n    }\n    Ok(())\n}`,
      },
    ],
    links: [
      { label: "View on GitHub", href: "https://github.com/rbhans/rust-bac" },
    ],
  },
  {
    id: "rustmod",
    name: "rustmod",
    protocol: "Modbus",
    kind: "Protocol",
    tagline: (
      <>
        Rust <b>Modbus workspace</b> · TCP and RTU, client + server
      </>
    ),
    description: (
      <>
        Open source Rust crate for Modbus communication in BAS applications. A modern, safe Rust Modbus library for building automation and industrial integrations. <em>Zero-copy codec</em>, no_std core, async and sync clients, TCP + RTU transports, and server support.
      </>
    ),
    githubUrl: "https://github.com/rbhans/rust-mod",
    meta: {
      language: "Rust",
      license: "MIT OR Apache-2.0",
      latest: "0.2.0",
      stars: 0,
      lastCommit: "Mar 5, 2026",
      status: "Active",
    },
    features: [
      {
        title: "Function codes 01–43",
        body: "Read/write coils, registers, holding/input registers, exception status, diagnostics, mask write, read FIFO queue, MEI device identification, and custom vendor codes.",
      },
      {
        title: "Zero-copy, no_std core",
        body: "rustmod-core decodes PDUs by borrowing from the input buffer with no heap allocation. Works without std or alloc for embedded use.",
      },
      {
        title: "Async + sync clients",
        body: "ModbusClient for async workflows, SyncModbusTcpClient for blocking. Both clonable across tasks.",
      },
      {
        title: "Server support + simulator",
        body: "TCP server, RTU-over-TCP server, optional native RTU serial server, and an InMemoryModbusService for testing without hardware.",
      },
    ],
    snippets: [
      {
        label: "Cargo.toml",
        body: `[dependencies]\nrustmod-client = "0.2"\nrustmod-datalink = "0.2"\ntokio = { version = "1", features = ["full"] }`,
      },
      {
        label: "TCP read holding registers",
        body: `use rustmod_client::ModbusClient;\nuse rustmod_datalink::ModbusTcpTransport;\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn std::error::Error>> {\n    let link = ModbusTcpTransport::connect("127.0.0.1:502").await?;\n    let client = ModbusClient::new(link);\n    let regs = client\n        .read_holding_registers(1, 0x006B, 3)\n        .await?;\n    println!("registers: {regs:?}");\n    Ok(())\n}`,
      },
    ],
    links: [
      { label: "View on GitHub", href: "https://github.com/rbhans/rust-mod" },
    ],
  },
  {
    id: "qrbas",
    name: "QRBAS",
    protocol: "Tool",
    kind: "Tool",
    tagline: (
      <>
        Self-hosted <b>QR equipment pages</b> for BAS teams · Niagara connector
      </>
    ),
    description: (
      <>
        Open source QR code tool for BAS workflows. Run one small server on the local network, add Niagara stations, print QR codes for equipment, and let technicians scan with a phone camera to see live point data in the browser. <em>No app store. No cloud backend. No technician logins.</em>
      </>
    ),
    githubUrl: "https://github.com/rbhans/qrbas",
    meta: {
      language: "Go",
      license: "—",
      latest: "—",
      stars: 0,
      lastCommit: "Apr 28, 2026",
      status: "Active",
    },
    features: [
      {
        title: "Embedded PWA + SQLite",
        body: "Single Go binary, embedded progressive web app, SQLite storage in ~/.qrbas/qrbas.db by default.",
      },
      {
        title: "Niagara connector",
        body: "Add Niagara stations from the admin UI, configure equipment, and print QR codes that resolve to live point data.",
      },
      {
        title: "Local-network only",
        body: "Runs on the BAS network. No cloud backend, no accounts, no telemetry.",
      },
    ],
    snippets: [
      {
        label: "Quick start",
        body: `cd server\ngo run .\n# open http://localhost:8080`,
      },
      {
        label: "Build",
        body: `cd server\ngo build -trimpath \\\n    -ldflags="-s -w" \\\n    -o qrbas-server .`,
      },
    ],
    links: [
      { label: "View on GitHub", href: "https://github.com/rbhans/qrbas" },
      { label: "Project site", href: "https://rbhans.github.io/qrbas/" },
    ],
  },
  {
    id: "niagarafalls",
    name: "NiagaraFalls",
    protocol: "Niagara 4",
    kind: "Module",
    tagline: (
      <>
        Niagara 4 <b>runtime module</b> · authenticated WebSocket station API
      </>
    ),
    description: (
      <>
        Niagara 4 runtime module that exposes station data through an authenticated WebSocket API. It gives external graphics, dashboards, commissioning tools, and integrations a practical live-data path without forcing every app to live inside Niagara UI.
      </>
    ),
    githubUrl: "https://github.com/rbhans/niagara-falls",
    meta: {
      language: "Java",
      license: "—",
      latest: "—",
      stars: 0,
      lastCommit: "May 26, 2026",
      status: "Active",
    },
    features: [
      {
        title: "Station discovery",
        body: "Browse station structure, describe objects, search bounded branches, and request metadata for devices, points, schedules, histories, alarms, and parent objects.",
      },
      {
        title: "Live values",
        body: "Read point snapshots and keep active graphics current with replaceable point subscriptions, lease renewal, and connection-scoped cleanup.",
      },
      {
        title: "Writable points",
        body: "Describe writable capabilities before rendering controls, then set, override, auto, or emergency override writable points through Niagara permissions.",
      },
      {
        title: "Alarms, schedules, and histories",
        body: "Read bounded alarm snapshots, subscribe to alarm changes, inspect schedules, and pull history records when an external app needs those views.",
      },
    ],
    snippets: [
      {
        label: "Station endpoint",
        body: `GET https://<station>/falls/health\nwss://<station>/falls`,
      },
      {
        label: "Companion demo",
        body: `node tools/niagarafalls-nav-tree-server.mjs --port=8787\n# open http://127.0.0.1:8787/`,
      },
    ],
    links: [
      { label: "View on GitHub", href: "https://github.com/rbhans/niagara-falls" },
    ],
  },
  {
    id: "opencrate-bms",
    name: "OpenCrate BMS",
    protocol: "BMS",
    kind: "BMS",
    tagline: (
      <>
        A <b>hobby BMS</b> · being built from scratch in Rust · coming soon
      </>
    ),
    description: (
      <>
        A hobby project to learn various parts of BMS by building the software from the ground up in pure Rust. Public release is <em>still pending</em>; the marketing site lists the planned feature set below.
      </>
    ),
    githubUrl: "https://rbhans.github.io/opencrate-site/",
    meta: {
      language: "Rust",
      license: "MIT",
      latest: "—",
      stars: "—",
      lastCommit: "—",
      status: "Coming soon",
    },
    features: [
      {
        title: "Multi-protocol",
        body: "Planned: BACnet/IP, BACnet/SC, MS/TP, Modbus TCP/RTU with auto-discovery, COV subscriptions, priority writes, and block reads.",
      },
      {
        title: "Alarms & routing",
        body: "Planned: high/low limit, deadband, intrinsic alarms; notification routing to email, SMS, or webhooks; shelving and escalation tiers.",
      },
      {
        title: "Trend logging",
        body: "Planned: interval and COV history with auto-downsampling across storage tiers; backfill from BACnet TrendLogs; CSV export.",
      },
      {
        title: "Visual logic engine + commissioning",
        body: "Planned: a block editor that compiles to scripts (PID, timers, math, comparisons) and per-device commissioning checklists with full audit trail.",
      },
    ],
    links: [
      { label: "Project site", href: "https://rbhans.github.io/opencrate-site/" },
    ],
  },
];

type FilterKind = "all" | "protocol" | "tool" | "module" | "bms";

export function OpenSourceView() {
  const [filter, setFilter] = useState<FilterKind>("all");

  const projects = useMemo(() => {
    if (filter === "all") return openSourceProjects;
    return openSourceProjects.filter((p) => p.kind.toLowerCase() === filter);
  }, [filter]);

  return (
    <section className="sand-section">
      <div className="nw-page">
        <div className="nw-head" style={{ padding: "0 0 14px", margin: "0 0 28px" }}>
          <span className="num">.05</span>
          <h1>Source / Open Source BAS Tools</h1>
          <span className="id">
            <span className="live-dot" /> <b>{openSourceProjects.length}</b> projects
          </span>
        </div>

        <p className="nw-tagline">
          Rust crates and tools for building BAS software from the ground up. <em>Protocol-first</em>, practical, open source.
        </p>

        <div className="sc-filter">
          <span className="label">Filter</span>
          {(["all", "protocol", "tool", "module", "bms"] as const).map((f) => (
            <button
              key={f}
              className="nw-pill"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "bms" ? "BMS" : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="count">
            <b>{projects.length}</b>shown
          </span>
        </div>

        {projects.map((project, idx) => (
          <article key={project.id} className="sc-section" id={project.id}>
            <header className="sc-section-head">
              <span className="sc-num">.{String(idx + 1).padStart(2, "0")}</span>
              <div className="sc-title-stack">
                <div className="row">
                  <h2 className="sc-name">{project.name}</h2>
                  <span className="sc-pill is-protocol">
                    {project.kind} · {project.protocol}
                  </span>
                  <span className="sc-pill is-status">
                    <span className="dot" />
                    {project.meta.status}
                  </span>
                </div>
                <div className="sc-tagline">{project.tagline}</div>
              </div>
              <a
                className="sc-cta"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubLogo weight="fill" />
                View on GitHub
              </a>
            </header>

            <p className="sc-desc">{project.description}</p>

            <div className="sc-meta tabular-nums">
              <MetaCell k="Language" v={project.meta.language} />
              <MetaCell k="License" v={project.meta.license} />
              <MetaCell k="Latest" v={project.meta.latest} />
              <MetaCell k="Stars" v={String(project.meta.stars)} />
              <MetaCell k="Last commit" v={project.meta.lastCommit} />
              <MetaCell k="Status" v={project.meta.status} dot />
            </div>

            <div className="sc-body">
              <div className="sc-block">
                <h4>
                  <span className="idx">A</span>Features
                </h4>
                <ul className="sc-features">
                  {project.features.map((feat, fi) => (
                    <li key={fi} data-n={String(fi + 1).padStart(2, "0")}>
                      <span>
                        <b>{feat.title}</b>
                        {feat.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="sc-side">
                {project.snippets?.map((snip, si) => (
                  <div key={si} className="sc-snippet">
                    <div className="hd">
                      <span className="lbl">{snip.label}</span>
                      <button
                        type="button"
                        className="copy"
                        onClick={() => navigator.clipboard?.writeText(snip.body)}
                      >
                        Copy
                      </button>
                    </div>
                    <pre>{snip.body}</pre>
                  </div>
                ))}
                {project.links.length > 0 && (
                  <div className="sc-block">
                    <h4>
                      <span className="idx">B</span>Links
                    </h4>
                    <ul className="sc-links">
                      {project.links.map((lnk, li) => (
                        <li key={li}>
                          <a href={lnk.href} target="_blank" rel="noreferrer">
                            {lnk.label}
                            <span className="arr">→</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MetaCell({ k, v, dot = false }: { k: string; v: string; dot?: boolean }) {
  return (
    <div className="cell">
      <span className="k">{k}</span>
      <span className="v">
        {dot && v !== "—" && <span className="commit-dot" />}
        {v}
      </span>
    </div>
  );
}
