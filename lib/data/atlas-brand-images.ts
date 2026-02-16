import type { AtlasBrand } from "@/lib/types";

const GOOGLE_FAVICON_SIZE = 128;

export type AtlasBrandImageSource = Pick<AtlasBrand, "logo_url" | "website">;

function getHostname(website: string): string | null {
  try {
    const normalized = website.startsWith("http://") || website.startsWith("https://")
      ? website
      : `https://${website}`;
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
}

export function getAtlasBrandImageUrl(brand: AtlasBrandImageSource): string | null {
  const explicitLogo = brand.logo_url?.trim();
  if (explicitLogo) return explicitLogo;

  const website = brand.website?.trim();
  if (!website) return null;

  const hostname = getHostname(website);
  if (!hostname) return null;

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=${GOOGLE_FAVICON_SIZE}`;
}
