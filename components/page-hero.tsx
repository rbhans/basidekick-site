import { ReactNode } from "react";

interface PageHeroProps {
  children: ReactNode;
  /** Center the text content */
  centered?: boolean;
}

/**
 * Shared hero section with gradient glow overlay.
 * Replaces the duplicated gradient-overlay + container pattern across pages.
 */
export function PageHero({ children, centered = false }: PageHeroProps) {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
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
