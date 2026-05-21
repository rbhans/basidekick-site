"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { Profile, PointStackCompany, PointStackProfile } from "@/lib/types";
import { ROUTES } from "@/lib/routes";
import {
  SignOut,
  Buildings,
  SignIn,
  PencilSimple,
  ArrowSquareOut,
  Eye,
  EyeSlash,
} from "@phosphor-icons/react";
import { AvatarUpload } from "@/components/avatar-upload";
import { UserAvatar } from "@/components/user-avatar";
import { fetchUserCompanies } from "@/components/pointstack/pointstack-api";
import { ProfileEditDialog } from "@/components/pointstack/profile/profile-edit-dialog";

export function AccountView() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [companies, setCompanies] = useState<(PointStackCompany & { _memberRole?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [togglingCompletions, setTogglingCompletions] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const [profileRes, userCompanies] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        fetchUserCompanies(user.id).catch(() => []),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
      }

      setCompanies(userCompanies);
      setLoading(false);
    }

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await signOut();
    router.push(ROUTES.HOME);
  };

  const handleToggleCompletions = async () => {
    if (!user || !profile) return;
    const next = !profile.show_completions;
    setTogglingCompletions(true);
    const supabase = createClient();
    if (!supabase) {
      setTogglingCompletions(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ show_completions: next })
      .eq("id", user.id);
    if (!error) {
      setProfile((prev) => (prev ? { ...prev, show_completions: next } : null));
    }
    setTogglingCompletions(false);
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <section className="container mx-auto max-w-[720px] px-4 sm:px-6 lg:px-16 py-20">
        <div className="pb-5 border-b border-foreground mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
            Account
          </div>
          <h1 className="font-heading font-semibold text-[32px] md:text-[40px] leading-[1.05] text-foreground">
            Sign in required
          </h1>
          <p className="italic text-[16px] text-muted-foreground mt-3">
            Sign in or create an account to view your purchases and manage your profile.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={ROUTES.SIGNIN}
            className="inline-flex items-center gap-1.5 px-5 py-3 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 transition-colors"
          >
            <SignIn className="w-3.5 h-3.5" />
            Sign in
          </Link>
          <Link
            href={ROUTES.SIGNUP}
            className="px-5 py-3 border border-foreground bg-card text-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-muted transition-colors"
          >
            Create account →
          </Link>
        </div>
      </section>
    );
  }

  // Loading
  if (authLoading || loading) {
    return (
      <div className="min-h-full flex items-center justify-center py-24">
        <p className="italic text-[16px] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Header */}
      <div className="pb-5 border-b border-foreground mb-10">
        <div className="grid grid-cols-[72px_1fr_auto] gap-5 items-start">
          <UserAvatar
            name={profile?.display_name || null}
            avatarUrl={profile?.avatar_url}
            size="lg"
            className="!size-[72px]"
          />
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-2">
              Account settings
            </div>
            <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground truncate">
              {profile?.display_name || "Your Account"}
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[1.1px] text-muted-foreground mt-2">
              {user?.email}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {profile?.display_name && (
                <Link
                  href={ROUTES.POINTSTACK_PROFILE(profile.display_name)}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.1px] text-accent hover:text-foreground transition-colors"
                >
                  <ArrowSquareOut className="w-3 h-3" />
                  View public profile →
                </Link>
              )}
              {companies[0] && (
                <Link
                  href={ROUTES.POINTSTACK_COMPANY(companies[0].slug)}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground hover:text-accent transition-colors"
                >
                  <Buildings className="w-3 h-3" />
                  {companies[0].name}
                </Link>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-foreground bg-card text-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-muted transition-colors"
          >
            <SignOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* 01 / PointStack */}
      <NumberedSection
        num="01"
        title="PointStack"
        action={
          profile?.display_name && (
            <Link
              href={ROUTES.POINTSTACK_PROFILE(profile.display_name)}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.2px] text-accent hover:text-foreground transition-colors"
            >
              <ArrowSquareOut className="w-3 h-3" />
              View profile →
            </Link>
          )
        }
      >
        {companies[0] ? (
          <Link
            href={ROUTES.POINTSTACK_COMPANY(companies[0].slug)}
            className="group flex items-start gap-4 py-4 px-3 border border-border bg-card hover:border-foreground transition-colors max-w-md"
          >
            {companies[0].logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companies[0].logo_url}
                alt={companies[0].name}
                className="w-12 h-12 border border-border object-cover"
              />
            ) : (
              <div className="w-12 h-12 border border-border bg-muted flex items-center justify-center shrink-0">
                <span className="font-heading font-semibold text-[18px] text-foreground">
                  {companies[0].name.charAt(0)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="font-heading font-semibold text-[16px] text-foreground group-hover:text-accent transition-colors truncate">
                {companies[0].name}
              </div>
              <div className="flex items-center gap-3 mt-1 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground">
                <span className="text-accent">{companies[0]._memberRole || "member"}</span>
                {companies[0].industry && <span>{companies[0].industry}</span>}
              </div>
            </div>
          </Link>
        ) : (
          <div className="py-10 text-center italic text-[15px] text-muted-foreground border border-dashed border-border">
            You&apos;re not a member of a company yet.{" "}
            <Link
              href={`${ROUTES.POINTSTACK}/companies`}
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent not-italic font-sans"
            >
              Browse companies →
            </Link>
          </div>
        )}
      </NumberedSection>

      {/* 02 / Profile picture */}
      <NumberedSection num="02" title="Profile picture">
        <div className="max-w-md">
          <AvatarUpload
            currentAvatarUrl={profile?.avatar_url || null}
            displayName={profile?.display_name || null}
            onAvatarChange={(newUrl) => {
              setProfile((prev) => (prev ? { ...prev, avatar_url: newUrl } : null));
            }}
          />
        </div>
      </NumberedSection>

      {/* 03 / Account details */}
      <NumberedSection
        num="03"
        title="Account details"
        action={
          <button
            onClick={() => setEditDialogOpen(true)}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.2px] text-accent hover:text-foreground transition-colors"
          >
            <PencilSimple className="w-3 h-3" />
            Edit profile →
          </button>
        }
      >
        <dl className="border-t border-b border-foreground max-w-[680px]">
          <DetailRow label="Email" value={<span className="font-mono">{user?.email}</span>} />
          <DetailRow label="Display name" value={profile?.display_name || "—"} />
          <DetailRow label="Headline" value={profile && "headline" in profile ? ((profile as Profile & { headline?: string }).headline || "—") : "—"} />
          <DetailRow label="Bio" value={profile?.bio ? <span className="whitespace-pre-wrap">{profile.bio}</span> : "—"} />
          <DetailRow
            label="Company"
            value={
              companies[0] ? (
                <Link
                  href={ROUTES.POINTSTACK_COMPANY(companies[0].slug)}
                  className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
                >
                  {companies[0].name}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <DetailRow
            label="Member since"
            value={
              profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "Unknown"
            }
          />
        </dl>
      </NumberedSection>

      {/* 04 / Privacy */}
      <NumberedSection num="04" title="Privacy">
        <div className="max-w-[680px] border border-border bg-card p-5">
          <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
            <div className="min-w-0">
              <div className="font-heading font-semibold text-[15px] text-foreground mb-1">
                Show course completions on public profile
              </div>
              <p className="text-[13px] text-muted-foreground leading-[1.5]">
                When on, anyone viewing your public profile sees your course progress and completed lessons. Off by default.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleCompletions}
              disabled={togglingCompletions || !profile}
              aria-pressed={profile?.show_completions ?? false}
              className={`inline-flex items-center gap-1.5 px-3 py-2 border font-mono text-[10px] uppercase tracking-[1.2px] transition-colors disabled:opacity-50 ${
                profile?.show_completions
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {profile?.show_completions ? (
                <>
                  <Eye className="w-3 h-3" /> On
                </>
              ) : (
                <>
                  <EyeSlash className="w-3 h-3" /> Off
                </>
              )}
            </button>
          </div>
        </div>
      </NumberedSection>

      {profile && (
        <ProfileEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          profile={profile as unknown as PointStackProfile}
          onSave={(updated) => setProfile((prev) => (prev ? { ...prev, ...updated } : (updated as unknown as Profile)))}
        />
      )}
    </section>
  );
}

function NumberedSection({
  num,
  title,
  action,
  children,
}: {
  num: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-12 last:mb-0">
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">{num} /</span>
        <h2 className="font-heading font-semibold text-[22px] leading-none text-foreground">
          {title}
        </h2>
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b border-border last:border-b-0">
      <dt className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-[14px] text-foreground">{value}</dd>
    </div>
  );
}
