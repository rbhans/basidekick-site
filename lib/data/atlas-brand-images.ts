import type { AtlasBrand } from "@/lib/types";

export type AtlasBrandImageSource = Pick<AtlasBrand, "logo_url">;

export function getAtlasBrandImageUrl(brand: AtlasBrandImageSource): string | null {
  const logo = brand.logo_url?.trim();
  return logo || null;
}
