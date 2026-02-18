import { createHash } from "node:crypto";
import path from "node:path";
import { readFile } from "node:fs/promises";
import type {
  AtlasData,
  BabelData,
  BabelGraphData,
  BabelTemplatesData,
} from "@/lib/types";

const CACHE_TTL_MS = 5 * 60 * 1000;

const BABEL_INDEX_URL = "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/index.json";
const BABEL_TEMPLATES_URL = "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/templates.json";
const BABEL_GRAPH_URL = "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/graph.json";
const ATLAS_INDEX_URL = "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/index.json";

const LOCAL_BABEL_INDEX_PATH = path.join(process.cwd(), "public", "data", "babel", "index.json");
const LOCAL_ATLAS_INDEX_PATH = path.join(process.cwd(), "public", "data", "atlas", "index.json");
const LOCAL_BABEL_TEMPLATES_PATH = path.join(process.cwd(), "..", "bas-babel", "dist", "templates.json");
const LOCAL_BABEL_GRAPH_PATH = path.join(process.cwd(), "..", "bas-babel", "dist", "graph.json");

type BasResources = {
  babel: BabelData;
  atlas: AtlasData;
  templates: BabelTemplatesData;
  graph: BabelGraphData;
  etag: string;
  loadedAt: number;
  meta: {
    babelVersion: string;
    atlasVersion: string;
    babelLastUpdated: string;
    atlasLastUpdated: string;
    templatesVersion: string;
    graphVersion: string;
    totalPoints: number;
    totalEquipment: number;
    totalModels: number;
    totalTemplates: number;
    totalGraphEdges: number;
  };
};

let cache: BasResources | null = null;

async function loadLocalJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function fetchRemoteJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function loadRequiredJson<T>(url: string, localPath?: string): Promise<T> {
  const remote = await fetchRemoteJson<T>(url);
  if (remote) {
    return remote;
  }

  if (localPath) {
    const local = await loadLocalJson<T>(localPath);
    if (local) {
      return local;
    }
  }

  throw new Error(`Failed to load required BAS resource: ${url}`);
}

function computeEtag(resources: {
  babel: BabelData;
  atlas: AtlasData;
  templates: BabelTemplatesData;
  graph: BabelGraphData;
}): string {
  const seed = [
    resources.babel.version,
    resources.babel.lastUpdated,
    resources.babel.totalPoints,
    resources.babel.totalEquipment,
    resources.atlas.version,
    resources.atlas.lastUpdated,
    resources.atlas.totalModels,
    resources.templates.version,
    resources.templates.lastUpdated,
    resources.templates.templates.length,
    resources.graph.version,
    resources.graph.lastUpdated,
    resources.graph.edges.length,
  ].join("|");

  return `\"${createHash("sha1").update(seed).digest("hex")}\"`;
}

export async function getBasResources(): Promise<BasResources> {
  if (cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache;
  }

  const [babel, atlas, templates, graph] = await Promise.all([
    loadRequiredJson<BabelData>(BABEL_INDEX_URL, LOCAL_BABEL_INDEX_PATH),
    loadRequiredJson<AtlasData>(ATLAS_INDEX_URL, LOCAL_ATLAS_INDEX_PATH),
    loadRequiredJson<BabelTemplatesData>(BABEL_TEMPLATES_URL, LOCAL_BABEL_TEMPLATES_PATH),
    loadRequiredJson<BabelGraphData>(BABEL_GRAPH_URL, LOCAL_BABEL_GRAPH_PATH),
  ]);

  const etag = computeEtag({ babel, atlas, templates, graph });

  cache = {
    babel,
    atlas,
    templates,
    graph,
    etag,
    loadedAt: Date.now(),
    meta: {
      babelVersion: babel.version,
      atlasVersion: atlas.version,
      babelLastUpdated: babel.lastUpdated,
      atlasLastUpdated: atlas.lastUpdated,
      templatesVersion: templates.version,
      graphVersion: graph.version,
      totalPoints: babel.totalPoints,
      totalEquipment: babel.totalEquipment,
      totalModels: atlas.totalModels,
      totalTemplates: templates.templates.length,
      totalGraphEdges: graph.edges.length,
    },
  };

  return cache;
}

export function getNotModifiedResponseHeaders(etag: string): HeadersInit {
  return {
    ETag: etag,
    "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
  };
}

export function isEtagMatch(ifNoneMatch: string | null, etag: string): boolean {
  if (!ifNoneMatch) return false;
  return ifNoneMatch.split(",").map((v) => v.trim()).includes(etag);
}
