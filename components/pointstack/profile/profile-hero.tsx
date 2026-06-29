"use client";

import type { ReactNode } from "react";
import { format } from "date-fns";
import {
  MapPin,
  Globe,
  LinkedinLogo,
  GithubLogo,
  UserPlus,
  Check,
  PencilSimple,
  ChatCircle,
  SealCheck,
} from "@phosphor-icons/react";
import { PointStackProfile } from "@/lib/types";

interface ProfileHeroProps {
  profile: PointStackProfile;
  isOwnProfile: boolean;
  viewerLoggedIn: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
  onEdit: () => void;
}

function initialsOf(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

const WATERMARK_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(245,245,245,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,245,245,.05) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
  maskImage: "linear-gradient(90deg, #000 0%, transparent 70%)",
  WebkitMaskImage: "linear-gradient(90deg, #000 0%, transparent 70%)",
};

export function ProfileHero({
  profile,
  isOwnProfile,
  viewerLoggedIn,
  isFollowing,
  onFollow,
  onMessage,
  onEdit,
}: ProfileHeroProps) {
  const memberSince = profile.created_at ? format(new Date(profile.created_at), "MMM yyyy") : null;
  const hasSocial = Boolean(profile.website_url || profile.linkedin_url || profile.github_url);

  const coverImage = profile.cover_image_url || null;
  const coverColor = profile.cover_color || null;
  const hasCoverImage = Boolean(coverImage);
  const bandStyle: React.CSSProperties = hasCoverImage
    ? { backgroundImage: `url("${coverImage}")`, backgroundSize: "cover", backgroundPosition: "center" }
    : coverColor
    ? { backgroundColor: coverColor }
    : {};

  return (
    <div>
      {/* Cover band */}
      <div
        className={`relative h-[120px] overflow-hidden rounded-t-lg border border-[var(--char-line-2)] sm:h-[150px] ${
          !hasCoverImage && !coverColor ? "bg-char" : ""
        }`}
        style={bandStyle}
      >
        {!hasCoverImage && <div aria-hidden className="absolute inset-0" style={WATERMARK_STYLE} />}
        {(hasCoverImage || coverColor) && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.3))" }}
          />
        )}
        <div className="relative z-[1] flex items-start justify-between gap-4 px-5 py-4 font-mono text-[10.5px] uppercase tracking-[0.18em]">
          <span className="inline-flex items-center gap-2 text-cream-2">
            <span className="text-punch">▸</span> Member
          </span>
          <span className="text-right leading-[1.7] text-cream-3">
            {memberSince && (
              <>
                Since <b className="font-medium text-cream">{memberSince}</b>
              </>
            )}
            {profile.location && (
              <>
                <br />
                {profile.location}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Header band */}
      <header className="relative grid grid-cols-1 items-end gap-5 rounded-b-lg border border-t-0 border-[var(--sand-line-2)] bg-card px-5 pb-6 sm:px-7 md:grid-cols-[auto_1fr_auto]">
        <div className="relative -mt-[46px] h-[104px] w-[104px] shrink-0 overflow-hidden rounded-lg border-4 border-card bg-ink shadow-md">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.display_name || "Avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-heading text-[38px] font-extrabold tracking-[-0.01em] text-sand">
              {initialsOf(profile.display_name)}
            </span>
          )}
        </div>

        <div className="min-w-0 pb-0.5">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="font-heading text-[26px] font-extrabold leading-none tracking-[-0.02em] text-ink sm:text-[30px]">
              {profile.display_name || "Anonymous"}
            </h1>
            {profile.username && (
              <span className="font-mono text-[12.5px] tracking-[0.06em] text-ink-3">@{profile.username}</span>
            )}
            {profile.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-[3px] border border-[var(--punch-soft-2)] bg-punch-soft px-2 py-[3px] font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-punch">
                <SealCheck className="h-2.5 w-2.5" weight="fill" /> Verified
              </span>
            )}
            {profile.availability_status === "available" && (
              <span className="rounded-[3px] border border-[var(--punch-soft-2)] bg-punch-soft px-2 py-[3px] font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-punch">
                Available
              </span>
            )}
          </div>

          {profile.headline && <div className="mb-2 text-[15px] font-medium text-ink">{profile.headline}</div>}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-[0.08em] text-ink-3">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </span>
            )}
            {profile.location && memberSince && <span className="text-ink-4">·</span>}
            {memberSince && (
              <span>
                Member since <b className="font-medium text-ink-2">{memberSince}</b>
              </span>
            )}
          </div>

          {hasSocial && (
            <div className="mt-3 flex items-center gap-2">
              {profile.website_url && (
                <SocialLink href={profile.website_url} label="Website">
                  <Globe className="h-4 w-4" />
                </SocialLink>
              )}
              {profile.linkedin_url && (
                <SocialLink href={profile.linkedin_url} label="LinkedIn">
                  <LinkedinLogo className="h-4 w-4" />
                </SocialLink>
              )}
              {profile.github_url && (
                <SocialLink href={profile.github_url} label="GitHub">
                  <GithubLogo className="h-4 w-4" />
                </SocialLink>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-0.5">
          {isOwnProfile ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--sand-line-2)] bg-card px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink"
            >
              <PencilSimple className="h-3.5 w-3.5" /> Edit profile
            </button>
          ) : viewerLoggedIn ? (
            <>
              <button
                type="button"
                onClick={onFollow}
                className={`inline-flex h-9 items-center gap-1.5 rounded-md px-4 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  isFollowing
                    ? "border border-[var(--sand-line-2)] bg-card text-ink hover:border-punch hover:text-punch"
                    : "bg-ink text-sand hover:bg-black"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" /> Follow
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onMessage}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--sand-line-2)] bg-card px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink"
              >
                <ChatCircle className="h-3.5 w-3.5" /> Message
              </button>
            </>
          ) : null}
        </div>
      </header>
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-sm border border-[var(--sand-line-2)] text-ink-3 transition-colors hover:border-ink hover:text-punch"
    >
      {children}
    </a>
  );
}
