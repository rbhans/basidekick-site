import { ReactNode } from "react";

interface PageHeroProps {
  children: ReactNode;
  /** Center the text content */
  centered?: boolean;
  /** Kept for backwards compatibility — ignored in the new design */
  imageSrc?: string;
  /** Kept for backwards compatibility — ignored in the new design */
  backgroundElement?: ReactNode;
}

/**
 * Page header wrapper. Retrofit of the old PageHero component — the hero
 * imagery, gradient glow, and vignette effects have been removed per the
 * redesign spec (§4.5). It now renders a simple padded section so legacy
 * pages using <PageHero> still look clean in the new palette.
 *
 * For new pages, prefer the title block strip pattern from spec §3.5
 * (see components/views/home-view.tsx for an example).
 */
export function PageHero({ children, centered = false }: PageHeroProps) {
  return (
    <section className="border-b border-border">
      <div
        className={`container mx-auto px-4 sm:px-6 lg:px-16 py-14 md:py-16 max-w-[1100px]${
          centered ? " text-center" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
