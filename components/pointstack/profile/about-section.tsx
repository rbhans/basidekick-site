"use client";

import { SectionBar } from "./section-bar";
import { ExpertiseSection } from "./expertise-section";
import { PointStackProfile, PointStackAvailabilityStatus } from "@/lib/types";

const AVAILABILITY_LABEL: Record<PointStackAvailabilityStatus, string> = {
  available: "Open to work",
  busy: "Busy",
  "not-looking": "Not looking",
};

export function AboutSection({
  profile,
  isOwnProfile,
}: {
  profile: PointStackProfile;
  isOwnProfile: boolean;
}) {
  const skills = profile.skills || [];

  const facts: { k: string; v: string }[] = [];
  if (profile.location) facts.push({ k: "Region", v: profile.location });
  if (profile.availability_status && AVAILABILITY_LABEL[profile.availability_status]) {
    facts.push({ k: "Status", v: AVAILABILITY_LABEL[profile.availability_status] });
  }

  const hasLeft = Boolean(profile.bio);
  const hasRight = skills.length > 0 || facts.length > 0;
  const showGrid = hasLeft || hasRight;

  // Section also hosts peer endorsements, which self-hide when empty.
  if (!showGrid && !isOwnProfile) return null;

  return (
    <section className="pt-11">
      <SectionBar num="01" title="About" />

      {showGrid && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_320px] md:gap-10">
          {hasLeft ? (
            <div className="max-w-[60ch] whitespace-pre-wrap text-[16px] leading-[1.6] text-ink">
              {profile.bio}
            </div>
          ) : (
            <div />
          )}

          <div>
            {skills.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-3 border-b border-[var(--sand-line)] pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                  Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-sm border border-[var(--sand-line-2)] bg-card px-2.5 py-1.5 font-mono text-[11px] tracking-[0.04em] text-ink-2"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {facts.length > 0 && (
              <>
                <h4 className="mb-3 border-b border-[var(--sand-line)] pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
                  Quick facts
                </h4>
                <ul className="m-0 list-none p-0">
                  {facts.map((f) => (
                    <li
                      key={f.k}
                      className="grid grid-cols-[96px_1fr] gap-3 border-b border-[var(--sand-line)] py-2.5 text-[13px] last:border-b-0"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">{f.k}</span>
                      <span className="text-ink">{f.v}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      <div className={showGrid ? "mt-8" : ""}>
        <ExpertiseSection profileId={profile.id} isOwnProfile={isOwnProfile} />
      </div>
    </section>
  );
}
