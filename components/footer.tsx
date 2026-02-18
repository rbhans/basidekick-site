"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ROUTES } from "@/lib/routes";
import { ArrowUp } from "@phosphor-icons/react";

const toolsLinks = [
  { href: ROUTES.TOOL("ssk"), label: "SSK" },
  { href: ROUTES.TOOL("qsk"), label: "QSK" },
];

const resourcesLinks = [
  { href: ROUTES.WIKI, label: "Wiki" },
  { href: ROUTES.RESOURCES_RUST, label: "Rust" },
  { href: ROUTES.PSK, label: "PSK" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Tools for BAS professionals. Built by someone who actually uses them.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Tools
            </h4>
            <ul className="space-y-2">
              {toolsLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              {resourcesLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BASidekick
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUp className="size-3" />
            Top
          </button>
        </div>
      </div>
    </footer>
  );
}
