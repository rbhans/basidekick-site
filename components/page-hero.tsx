import { ReactNode } from "react";
import Image from "next/image";

interface PageHeroProps {
  children: ReactNode;
  /** Center the text content */
  centered?: boolean;
  /** Optional static background image path (e.g., "/images/hero/tools.png") */
  imageSrc?: string;
  /** Optional custom background component (replaces imageSrc) */
  backgroundElement?: ReactNode;
}

/**
 * Shared hero section with gradient glow overlay.
 * Replaces the duplicated gradient-overlay + container pattern across pages.
 */
export function PageHero({ children, centered = false, imageSrc, backgroundElement }: PageHeroProps) {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Custom background element (takes priority over imageSrc) */}
      {backgroundElement}

      {/* Static background image (when provided and no custom background) */}
      {imageSrc && !backgroundElement && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />

          {/* Heavy dark overlay */}
          <div className="absolute inset-0 bg-background/80" />

          {/* Radial vignette */}
          <div
            className="absolute inset-0 bg-background"
            style={{
              maskImage:
                "radial-gradient(ellipse 65% 55% at 50% 35%, transparent 15%, black 65%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 65% 55% at 50% 35%, transparent 15%, black 65%)",
            }}
          />

          {/* Bottom hard fade */}
          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-background via-background/90 to-transparent" />

          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-background/70 to-transparent" />

          {/* Side fades */}
          <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent" />
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-[0.04] gradient-glow" />
      </div>
      <div
        className={`container mx-auto px-4 sm:px-6 lg:px-20 relative z-10${
          centered ? " text-center" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
