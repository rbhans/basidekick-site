import { cache } from "react";
import path from "path";
import { readFile } from "fs/promises";
import type { AtlasBrand, AtlasData, AtlasModel, AtlasType } from "@/lib/types";

const REMOTE_ATLAS_DATA_URL =
  "https://raw.githubusercontent.com/rbhans/bas-atlas/main/dist/index.json";
const LOCAL_ATLAS_DATA_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "atlas",
  "index.json"
);

async function loadLocalAtlasData(): Promise<AtlasData | null> {
  try {
    const raw = await readFile(LOCAL_ATLAS_DATA_PATH, "utf8");
    return JSON.parse(raw) as AtlasData;
  } catch {
    return null;
  }
}

async function fetchRemoteAtlasData(): Promise<AtlasData | null> {
  try {
    const response = await fetch(REMOTE_ATLAS_DATA_URL, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return (await response.json()) as AtlasData;
  } catch {
    return null;
  }
}

export const getAtlasData = cache(async (): Promise<AtlasData | null> => {
  if (process.env.NODE_ENV === "development") {
    const local = await loadLocalAtlasData();
    if (local) return local;
  }

  return fetchRemoteAtlasData();
});

function getBrandBySlug(data: AtlasData, slug: string): AtlasBrand | undefined {
  return data.brands.find((brand) => brand.slug === slug || brand.id === slug);
}

function getTypeBySlug(data: AtlasData, slug: string): AtlasType | undefined {
  return data.types.find((type) => type.slug === slug || type.id === slug);
}

export async function getAtlasBrand(slug: string): Promise<AtlasBrand | null> {
  const data = await getAtlasData();
  if (!data) return null;
  return getBrandBySlug(data, slug) || null;
}

export async function getAtlasType(
  _brandSlug: string,
  typeSlug: string
): Promise<AtlasType | null> {
  const data = await getAtlasData();
  if (!data) return null;
  return getTypeBySlug(data, typeSlug) || null;
}

export async function getAtlasModel(
  brandSlug: string,
  typeSlug: string,
  modelSlug: string
): Promise<AtlasModel | null> {
  const data = await getAtlasData();
  if (!data) return null;

  const brand = getBrandBySlug(data, brandSlug);
  const type = getTypeBySlug(data, typeSlug);
  if (!brand || !type) return null;

  return (
    data.models.find(
      (model) =>
        model.brand === brand.id &&
        model.type === type.id &&
        (model.slug === modelSlug || model.id === modelSlug)
    ) || null
  );
}

export async function getAllBrandSlugs(): Promise<string[]> {
  const data = await getAtlasData();
  if (!data) return [];
  return data.brands.map((brand) => brand.slug || brand.id);
}

export async function getAllTypeSlugs(): Promise<Array<{ brand: string; type: string }>> {
  const data = await getAtlasData();
  if (!data) return [];

  const brandById = new Map(data.brands.map((brand) => [brand.id, brand]));
  const typeById = new Map(data.types.map((type) => [type.id, type]));
  const pairs = new Map<string, { brand: string; type: string }>();

  for (const model of data.models) {
    const brand = brandById.get(model.brand);
    const type = typeById.get(model.type);
    if (!brand || !type) continue;

    const brandSlug = brand.slug || brand.id;
    const typeSlug = type.slug || type.id;
    const key = `${brandSlug}::${typeSlug}`;
    if (!pairs.has(key)) {
      pairs.set(key, { brand: brandSlug, type: typeSlug });
    }
  }

  return Array.from(pairs.values());
}

export async function getAllModelSlugs(): Promise<
  Array<{ brand: string; type: string; model: string }>
> {
  const data = await getAtlasData();
  if (!data) return [];

  const brandById = new Map(data.brands.map((brand) => [brand.id, brand]));
  const typeById = new Map(data.types.map((type) => [type.id, type]));

  return data.models
    .map((model) => {
      const brand = brandById.get(model.brand);
      const type = typeById.get(model.type);
      if (!brand || !type) return null;

      return {
        brand: brand.slug || brand.id,
        type: type.slug || type.id,
        model: model.slug || model.id,
      };
    })
    .filter((entry): entry is { brand: string; type: string; model: string } => Boolean(entry));
}
