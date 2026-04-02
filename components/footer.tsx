"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const toolsLinks = [
  { href: ROUTES.ATLAS, label: "BAS Atlas" },
  { href: "/calculators", label: "Calculators" },
];

const resourcesLinks = [
  { href: ROUTES.WIKI, label: "Wiki" },
  { href: ROUTES.ATLAS, label: "BAS Atlas" },
  { href: ROUTES.RESOURCES_RUST, label: "Rust Crates" },
  { href: "/references", label: "References" },
];

const communityLinks = [
  { href: ROUTES.POINTSTACK, label: "PointStack" },
  { href: "mailto:rob@basidekick.com", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
          {/* Brand */}
          <div>
            <Link href="/" className="font-heading text-[20px] font-bold text-foreground hover:text-primary transition-colors">
              [BASidekick]
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Tools, community, and knowledge for building automation professionals.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">
              Tools
            </h4>
            <ul className="space-y-3">
              {toolsLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {resourcesLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-mono text-[12px] font-bold text-muted-foreground tracking-[2px] uppercase mb-4">
              Community
            </h4>
            <ul className="space-y-3">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-16 pt-8 border-t border-border gap-4">
          <p className="text-[13px] text-muted-foreground">
            &copy; {new Date().getFullYear()} BASidekick. All rights reserved.
          </p>
          <a
            href="mailto:rob@basidekick.com"
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            rob@basidekick.com
          </a>
        </div>
      </div>
    </footer>
  );
}
