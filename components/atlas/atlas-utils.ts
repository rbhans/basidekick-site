import type { AtlasBrand, AtlasType, AtlasModel, AtlasData } from "@/lib/types";

export function getBrandBySlug(data: AtlasData, slug: string): AtlasBrand | undefined {
  return data.brands.find((brand) => brand.slug === slug || brand.id === slug);
}

export function getTypeBySlug(data: AtlasData, slug: string): AtlasType | undefined {
  return data.types.find((type) => type.slug === slug || type.id === slug);
}

export function getModelBySlug(
  data: AtlasData,
  brandSlug: string,
  typeSlug: string,
  modelSlug: string
): AtlasModel | undefined {
  const brand = getBrandBySlug(data, brandSlug);
  const type = getTypeBySlug(data, typeSlug);
  if (!brand || !type) return undefined;

  return data.models.find(
    (model) =>
      model.brand === brand.id &&
      model.type === type.id &&
      (model.slug === modelSlug || model.id === modelSlug)
  );
}

export function getModelsForBrand(data: AtlasData, brandId: string): AtlasModel[] {
  return data.models.filter((model) => model.brand === brandId);
}

export function getModelsForType(data: AtlasData, brandId: string, typeId: string): AtlasModel[] {
  return data.models.filter((model) => model.brand === brandId && model.type === typeId);
}
