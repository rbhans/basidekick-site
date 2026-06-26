"use client";

import Link from "next/link";
import { Plus, PencilSimple } from "@phosphor-icons/react";
import { SectionBar } from "./section-bar";
import { WorkExperience } from "@/lib/types";

interface EquipmentGroup {
  brandName: string;
  brandSlug: string;
  items: { id: string; name: string; href: string }[];
}

interface ExperienceSectionProps {
  entries: WorkExperience[];
  equipmentByBrand: EquipmentGroup[];
  isOwnProfile: boolean;
  onManage: () => void;
}

function yearOf(date: string | null): string | null {
  return date ? date.slice(0, 4) : null;
}

export function ExperienceSection({
  entries,
  equipmentByBrand,
  isOwnProfile,
  onManage,
}: ExperienceSectionProps) {
  const hasWork = entries.length > 0;
  const hasEquipment = equipmentByBrand.length > 0;

  if (!hasWork && !hasEquipment && !isOwnProfile) return null;

  return (
    <section className="pt-11">
      <SectionBar
        num="02"
        title="Experience"
        meta={
          isOwnProfile ? (
            <button
              type="button"
              onClick={onManage}
              className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--sand-line-2)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-2 transition-colors hover:border-ink hover:text-ink"
            >
              {hasWork ? (
                <>
                  <PencilSimple className="h-3 w-3" /> Manage
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" /> Add experience
                </>
              )}
            </button>
          ) : hasWork ? (
            <>
              <b className="font-medium text-ink-2">{entries.length}</b> {entries.length === 1 ? "entry" : "entries"}
            </>
          ) : undefined
        }
      />

      {hasWork ? (
        <div className="flex flex-col">
          {entries.map((e, i) => (
            <TimelineItem key={e.id} entry={e} last={i === entries.length - 1} />
          ))}
        </div>
      ) : isOwnProfile ? (
        <p className="rounded-md border border-dashed border-[var(--sand-line-2)] px-5 py-8 text-center text-[14px] italic text-ink-3">
          Add your work and education history so people can see your background.
        </p>
      ) : null}

      {hasEquipment && (
        <div className="mt-8">
          <h3 className="mb-3 border-b border-[var(--sand-line)] pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            Hands-on equipment
          </h3>
          <div className="space-y-5">
            {equipmentByBrand.map((g) => (
              <div key={g.brandSlug}>
                <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.13em] text-ink-3">
                  <span className="mr-1.5 text-punch">·</span>
                  {g.brandName}
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <Link
                      key={it.id}
                      href={it.href}
                      className="rounded-sm border border-[var(--sand-line-2)] bg-card px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-2 transition-colors hover:border-punch hover:text-punch"
                    >
                      {it.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function TimelineItem({ entry, last }: { entry: WorkExperience; last: boolean }) {
  const start = yearOf(entry.start_date);
  const end = entry.is_current ? "Now" : yearOf(entry.end_date) || "—";

  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-[160px_1fr]">
      <div className="pr-6 pt-0.5 font-mono text-[11px] leading-[1.7] tracking-[0.1em] text-ink-3">
        <b className="block font-medium text-ink-2">
          {start} — {end}
        </b>
        {entry.location && <span className="text-[10px] uppercase">{entry.location}</span>}
      </div>
      <div
        className={`relative border-l border-[var(--sand-line-2)] pl-7 max-md:border-l-0 max-md:pl-0 ${
          last ? "pb-1.5" : "pb-7"
        }`}
      >
        <span
          className={`absolute -left-[5px] top-1 hidden h-[9px] w-[9px] rounded-full border-2 bg-card md:block ${
            entry.kind === "education" ? "border-ink-3" : "border-ink"
          }`}
        />
        <h3 className="mb-0.5 font-heading text-[18px] font-bold leading-[1.15] tracking-[-0.01em] text-ink">
          {entry.title}
        </h3>
        <div className="mb-2 text-[13.5px] text-ink-2">
          {entry.organization_url ? (
            <a
              href={entry.organization_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-punch text-ink transition-colors hover:text-punch"
            >
              {entry.organization}
            </a>
          ) : (
            entry.organization
          )}
          {entry.kind === "education" && " · Education"}
        </div>
        {entry.description && (
          <p className="mb-2.5 max-w-[64ch] text-[14px] leading-[1.55] text-ink-2">{entry.description}</p>
        )}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((t) => (
              <span
                key={t}
                className="rounded-[3px] border border-[var(--sand-line-2)] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-3"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
