import { cache } from "react";
import { dbAll, dbGet } from "@/lib/data/atlas-db";
import type { AtlasBrand, AtlasData, AtlasModel, AtlasType } from "@/lib/types";

export const getAtlasData = cache(async (): Promise<AtlasData | null> => {
  try {
    const brands = dbAll<AtlasBrand>(
      "SELECT id, name, slug, logo_url, website, description FROM brands ORDER BY name"
    );
    const types = dbAll<AtlasType>(
      "SELECT id, name, slug, description FROM types ORDER BY name"
    );

    const modelRows = dbAll<AtlasModel & { brand_id: string; type_id: string }>(
      `SELECT m.id, m.brand_id as brand, m.type_id as type, m.name, m.slug,
              m.description, m.status, m.manufacturer_url, m.image_url, m.added_at
       FROM models m ORDER BY m.name`
    );

    const models: AtlasModel[] = modelRows.map((m) => ({
      ...m,
      model_numbers: dbAll<{ model_number: string }>(
        "SELECT model_number FROM model_numbers WHERE model_id = ?",
        m.id
      ).map((r) => r.model_number),
      protocols: dbAll<{ protocol: string }>(
        "SELECT protocol FROM model_protocols WHERE model_id = ?",
        m.id
      ).map((r) => r.protocol),
    }));

    const meta = dbGet<{ value: string }>(
      "SELECT value FROM meta WHERE key = 'lastUpdated'"
    );

    return {
      version: "1.0.0",
      lastUpdated: meta?.value ?? new Date().toISOString(),
      totalBrands: brands.length,
      totalTypes: types.length,
      totalModels: models.length,
      brands,
      types,
      models,
    };
  } catch {
    return null;
  }
});

export async function getAtlasBrand(slug: string): Promise<AtlasBrand | null> {
  return (
    dbGet<AtlasBrand>(
      "SELECT id, name, slug, logo_url, website, description FROM brands WHERE slug = ? OR id = ?",
      slug,
      slug
    ) ?? null
  );
}

export async function getAtlasType(
  _brandSlug: string,
  typeSlug: string
): Promise<AtlasType | null> {
  return (
    dbGet<AtlasType>(
      "SELECT id, name, slug, description FROM types WHERE slug = ? OR id = ?",
      typeSlug,
      typeSlug
    ) ?? null
  );
}

export async function getAtlasModel(
  brandSlug: string,
  typeSlug: string,
  modelSlug: string
): Promise<AtlasModel | null> {
  const model = dbGet<AtlasModel & { brand_id: string; type_id: string }>(
    `SELECT m.id, m.brand_id as brand, m.type_id as type, m.name, m.slug,
            m.description, m.status, m.manufacturer_url, m.image_url, m.added_at
     FROM models m
     JOIN brands b ON b.id = m.brand_id
     JOIN types t ON t.id = m.type_id
     WHERE (b.slug = ? OR b.id = ?) AND (t.slug = ? OR t.id = ?) AND (m.slug = ? OR m.id = ?)`,
    brandSlug,
    brandSlug,
    typeSlug,
    typeSlug,
    modelSlug,
    modelSlug
  );
  if (!model) return null;

  return {
    ...model,
    model_numbers: dbAll<{ model_number: string }>(
      "SELECT model_number FROM model_numbers WHERE model_id = ?",
      model.id
    ).map((r) => r.model_number),
    protocols: dbAll<{ protocol: string }>(
      "SELECT protocol FROM model_protocols WHERE model_id = ?",
      model.id
    ).map((r) => r.protocol),
  };
}

export async function getAllBrandSlugs(): Promise<string[]> {
  return dbAll<{ slug: string }>("SELECT slug FROM brands ORDER BY name").map(
    (r) => r.slug
  );
}

export async function getAllTypeSlugs(): Promise<
  Array<{ brand: string; type: string }>
> {
  return dbAll<{ brand: string; type: string }>(
    `SELECT DISTINCT b.slug as brand, t.slug as type
     FROM models m
     JOIN brands b ON b.id = m.brand_id
     JOIN types t ON t.id = m.type_id`
  );
}

export async function getAllModelSlugs(): Promise<
  Array<{ brand: string; type: string; model: string }>
> {
  return dbAll<{ brand: string; type: string; model: string }>(
    `SELECT b.slug as brand, t.slug as type, m.slug as model
     FROM models m
     JOIN brands b ON b.id = m.brand_id
     JOIN types t ON t.id = m.type_id`
  );
}
