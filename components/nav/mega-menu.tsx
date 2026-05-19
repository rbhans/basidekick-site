"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Popover } from "radix-ui";
import { CaretDown } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { ease } from "@/components/motion";
import type { NavGroup } from "./nav-config";

interface MegaMenuProps {
  group: NavGroup;
}

export function MegaMenu({ group }: MegaMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isGroupActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`relative px-3 py-2 rounded-sm font-sans text-[13.5px] font-medium transition-colors inline-flex items-center gap-1 ${
            isGroupActive
              ? "text-ink"
              : "text-ink-2 hover:text-ink hover:bg-[var(--sand-2)]"
          }`}
          aria-label={`${group.label} menu`}
        >
          {group.label}
          <CaretDown
            className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            weight="bold"
          />
          {isGroupActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute left-3 right-5 -bottom-px h-[2px] bg-punch rounded-[2px]"
              transition={ease.spring}
            />
          )}
        </button>
      </Popover.Trigger>

      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              align="start"
              sideOffset={8}
              className="z-50 outline-none"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.14, ease: [0.2, 0.8, 0.2, 1] }}
                className="w-[480px] bg-background border border-[var(--sand-line)] shadow-[0_18px_48px_-12px_rgba(20,18,16,0.18)] rounded-sm overflow-hidden"
              >
                {/* Eyebrow */}
                <div className="px-5 pt-4 pb-2 border-b border-[var(--sand-line-2)]">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
                    {group.label}
                  </span>
                </div>

                {/* Items grid */}
                <ul className="grid grid-cols-2 gap-px bg-[var(--sand-line-2)]">
                  {group.items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href} className="bg-background">
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`block px-5 py-3.5 transition-colors hover:bg-[var(--sand-2)] ${
                            active ? "bg-[var(--sand-2)]" : ""
                          }`}
                        >
                          <div className={`font-sans text-[14px] font-semibold leading-tight ${
                            active ? "text-punch" : "text-ink"
                          }`}>
                            {item.label}
                          </div>
                          <div className="mt-1 font-sans text-[12px] text-ink-3 leading-snug">
                            {item.desc}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Featured strip */}
                <Link
                  href={group.featured.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-5 py-3 border-t border-[var(--sand-line-2)] bg-[var(--sand-2)] hover:bg-[var(--sand-3,var(--sand-2))] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-punch">
                      {group.featured.eyebrow}
                    </span>
                    <span className="font-sans text-[13px] font-medium text-ink">
                      {group.featured.label.replace(/\s*→\s*$/, "")}
                    </span>
                  </div>
                  <span className="font-mono text-[14px] text-ink-3 group-hover:text-punch group-hover:translate-x-0.5 transition-all">
                    →
                  </span>
                </Link>
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
