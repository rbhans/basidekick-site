import { cache } from "react";
import path from "path";
import { readFile } from "fs/promises";
import type { BabelData, BabelEquipmentEntry, BabelPointEntry } from "@/lib/types";

const REMOTE_BABEL_DATA_URL =
  "https://raw.githubusercontent.com/rbhans/bas-babel/main/dist/index.json";
const LOCAL_BABEL_DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "babel",
  "index.json"
);

async function loadLocalBabelData(): Promise<BabelData | null> {
  try {
    const raw = await readFile(LOCAL_BABEL_DATA_PATH, "utf8");
    return JSON.parse(raw) as BabelData;
  } catch {
    return null;
  }
}

async function fetchRemoteBabelData(): Promise<BabelData | null> {
  try {
    const response = await fetch(REMOTE_BABEL_DATA_URL, {
      next: { revalidate: 86400 },
    });
    if (!response.ok) return null;
    return (await response.json()) as BabelData;
  } catch {
    return null;
  }
}

export const getBabelData = cache(async (): Promise<BabelData | null> => {
  if (process.env.NODE_ENV === "development") {
    const local = await loadLocalBabelData();
    if (local) return local;
  }

  return fetchRemoteBabelData();
});

export type BabelEntryLookup = {
  data: BabelPointEntry | BabelEquipmentEntry;
  type: "point" | "equipment";
};

export const getBabelEntry = cache(async (id: string): Promise<BabelEntryLookup | null> => {
  const data = await getBabelData();
  if (!data || !id) return null;

  const pointEntry = data.points.find((point) => point.concept.id === id);
  if (pointEntry) {
    return { data: pointEntry, type: "point" };
  }

  const equipmentEntry = data.equipment.find((equipment) => equipment.id === id);
  if (equipmentEntry) {
    return { data: equipmentEntry, type: "equipment" };
  }

  return null;
});

export const getAllBabelIds = cache(async (): Promise<string[]> => {
  const data = await getBabelData();
  if (!data) return [];

  const ids = new Set<string>();
  for (const point of data.points) {
    if (point.concept?.id) ids.add(point.concept.id);
  }
  for (const equipment of data.equipment) {
    if (equipment.id) ids.add(equipment.id);
  }

  return Array.from(ids);
});
