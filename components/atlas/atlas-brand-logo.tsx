"use client";

import { useState } from "react";
import type { AtlasBrand } from "@/lib/types";
import { getAtlasBrandImageUrl } from "@/lib/data/atlas-brand-images";

type AtlasBrandLogoBrand = Pick<AtlasBrand, "id" | "name" | "logo_url" | "website">;

interface AtlasBrandLogoProps {
  brand: AtlasBrandLogoBrand;
  className?: string;
  fallbackClassName?: string;
}

export function AtlasBrandLogo({
  brand,
  className = "size-8",
  fallbackClassName = "size-8 rounded bg-muted flex items-center justify-center text-sm font-semibold",
}: AtlasBrandLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoUrl = getAtlasBrandImageUrl(brand);

  if (!logoUrl || imageFailed) {
    return (
      <div className={fallbackClassName}>
        {brand.name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${brand.name} logo`}
      className={`${className} object-contain`}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  );
}
