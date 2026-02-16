"use client";

import { useState } from "react";
import type { AtlasBrand } from "@/lib/types";
import { getAtlasBrandImageUrl } from "@/lib/data/atlas-brand-images";
import { cn } from "@/lib/utils";

type AtlasBrandLogoBrand = Pick<AtlasBrand, "id" | "name" | "logo_url" | "website">;

interface AtlasBrandLogoProps {
  brand: AtlasBrandLogoBrand;
  className?: string;
  fallbackClassName?: string;
  logoContainerClassName?: string;
}

export function AtlasBrandLogo({
  brand,
  className = "size-8",
  fallbackClassName = "size-8 rounded bg-muted flex items-center justify-center text-sm font-semibold",
  logoContainerClassName = "rounded-md border border-border/60 bg-white p-1 shadow-sm",
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
    <div className={cn("shrink-0", className, logoContainerClassName)}>
      <img
        src={logoUrl}
        alt={`${brand.name} logo`}
        className="size-full object-contain"
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
}
