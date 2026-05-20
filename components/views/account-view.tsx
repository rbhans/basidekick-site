"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { License, Profile, PointStackCompany } from "@/lib/types";
import { TOOLS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { validateDisplayName, MAX_LENGTHS, MIN_LENGTHS } from "@/lib/security";
import {
  SignOut,
  Download,
  Key,
  Calendar,
  Buildings,
  SignIn,
  PencilSimple,
  X,
  Check,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { AvatarUpload } from "@/components/avatar-upload";
import { UserAvatar } from "@/components/user-avatar";
import { fetchUserCompanies } from "@/components/pointstack/pointstack-api";

export function AccountView() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [companies, setCompanies] = useState<(PointStackCompany & { _memberRole?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

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

      // Fetch profile, licenses, and companies in parallel
      const [profileRes, licensesRes, userCompanies] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("licenses").select("*").eq("user_id", user.id),
        fetchUserCompanies(user.id).catch(() => []),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
      }

      if (licensesRes.data) {
        setLicenses(licensesRes.data as License[]);
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

  const handleStartEdit = () => {
    setEditDisplayName(profile?.display_name || "");
    setEditError("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditDisplayName("");
    setEditError("");
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate display name
    const validation = validateDisplayName(editDisplayName);
    if (!validation.valid) {
      setEditError(validation.error || "Invalid display name");
      return;
    }

    setSaving(true);
    setEditError("");

    const supabase = createClient();
    if (!supabase) {
      setSaving(false);
      setEditError("Failed to save. Please try again.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: validation.sanitized })
      .eq("id", user.id);

    if (error) {
      setSaving(false);
      setEditError("Failed to save. Please try again.");
      return;
    }

    // Update local state
    setProfile((prev) =>
      prev ? { ...prev, display_name: validation.sanitized } : null
    );
    setIsEditing(false);
    setSaving(false);
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
              Account
            </div>
            <h1 className="font-heading font-semibold text-[32px] md:text-[38px] leading-[1.05] text-foreground truncate">
              {profile?.display_name || "Your Account"}
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[1.1px] text-muted-foreground mt-2">
              {user?.email}
            </p>
            {companies[0] && (
              <Link
                href={ROUTES.POINTSTACK_COMPANY(companies[0].slug)}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground hover:text-accent transition-colors mt-1"
              >
                <Buildings className="w-3 h-3" />
                {companies[0].name}
              </Link>
            )}
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

      {/* 02 / Owned software */}
      <NumberedSection num="02" title="Owned software">
        {licenses.length === 0 ? (
          <div className="py-10 text-center italic text-[15px] text-muted-foreground border border-dashed border-border">
            You haven&apos;t purchased any software yet.{" "}
            <Link
              href={ROUTES.TOOLS}
              className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent not-italic font-sans"
            >
              Browse tools →
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {licenses.map((license, idx) => {
              const tool = TOOLS[license.product_id];
              return (
                <div
                  key={license.id}
                  className="grid grid-cols-[28px_1fr_auto] gap-4 items-center py-4 px-2 border-b border-muted"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="font-heading font-semibold text-[16px] text-foreground">
                      {tool?.name || license.product_id.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-3 mt-1 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground flex-wrap">
                      <span
                        className={
                          license.is_active ? "text-accent" : "text-destructive"
                        }
                      >
                        {license.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        <span className="tabular-nums">
                          {license.license_key.slice(0, 8)}…
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="tabular-nums">
                          {new Date(license.purchased_at).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-foreground bg-card text-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-muted transition-colors">
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </NumberedSection>

      {/* 03 / Profile picture */}
      <NumberedSection num="03" title="Profile picture">
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

      {/* 04 / Account details */}
      <NumberedSection
        num="04"
        title="Account details"
        action={
          !isEditing && (
            <button
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[1.2px] text-accent hover:text-foreground transition-colors"
            >
              <PencilSimple className="w-3 h-3" />
              Edit →
            </button>
          )
        }
      >
        {/* Edit form */}
        {isEditing && (
          <div className="mb-6 p-5 border border-foreground bg-card max-w-md">
            <div className="font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground mb-3">
              Edit display name
            </div>
            <input
              type="text"
              value={editDisplayName}
              onChange={(e) => {
                setEditDisplayName(e.target.value);
                if (editError) setEditError("");
              }}
              maxLength={MAX_LENGTHS.DISPLAY_NAME}
              placeholder="Enter display name…"
              className="w-full border border-border bg-background focus:border-foreground transition-colors outline-none px-3 py-2 text-[14px] text-foreground font-sans"
            />
            <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[1px] text-muted-foreground">
              <span>
                {MIN_LENGTHS.DISPLAY_NAME}-{MAX_LENGTHS.DISPLAY_NAME} chars
              </span>
              <span className="tabular-nums">
                {editDisplayName.length}/{MAX_LENGTHS.DISPLAY_NAME}
              </span>
            </div>
            {editError && (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[1.1px] text-destructive">
                {editError}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-border bg-card text-muted-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:border-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-foreground bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-[1.2px] hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Check className="w-3 h-3" />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}

        <dl className="border-t border-b border-foreground max-w-[680px]">
          <DetailRow label="Email" value={<span className="font-mono">{user?.email}</span>} />
          <DetailRow label="Display name" value={profile?.display_name || "—"} />
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
