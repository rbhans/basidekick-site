"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteBadge } from "@/components/site-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { License, Profile, PointStackCompany } from "@/lib/types";
import { TOOLS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { validateDisplayName, MAX_LENGTHS, MIN_LENGTHS } from "@/lib/security";
import {
  User,
  Package,
  SignOut,
  Download,
  Key,
  Calendar,
  Buildings,
  SignIn,
  PencilSimple,
  X,
  Check,
  UserCircle,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { AvatarUpload } from "@/components/avatar-upload";
import { UserAvatar } from "@/components/user-avatar";
import { fetchUserCompanies } from "@/components/pointstack/pointstack-api";
import { PageHero } from "@/components/page-hero";

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
      <div className="min-h-full">
        <PageHero>
            <SiteBadge label="ACCOUNT" />

            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Sign In Required
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Sign in or create an account to view your purchases and manage your profile.
            </p>

            <div className="mt-8 flex gap-4">
              <Button asChild>
                <Link href={ROUTES.SIGNIN}>
                  <SignIn className="size-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={ROUTES.SIGNUP}>
                  Create Account
                </Link>
              </Button>
            </div>
        </PageHero>
      </div>
    );
  }

  // Loading
  if (authLoading || loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="text-muted-foreground font-mono">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <PageHero>
          <SiteBadge label="ACCOUNT" />

          <div className="mt-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <UserAvatar
                name={profile?.display_name || null}
                avatarUrl={profile?.avatar_url}
                size="lg"
                className="!size-16"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                  {profile?.display_name || "Your Account"}
                </h1>
                <p className="mt-1 text-muted-foreground">{user?.email}</p>
                {companies[0] && (
                  <Link
                    href={ROUTES.POINTSTACK_COMPANY(companies[0].slug)}
                    className="mt-1 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Buildings className="size-3" />
                    {companies[0].name}
                  </Link>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <SignOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </div>
      </PageHero>

      {/* PointStack */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Buildings className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">PointStack</h2>
            </div>
            {profile?.display_name && (
              <Button variant="outline" size="sm" asChild>
                <Link href={ROUTES.POINTSTACK_PROFILE(profile.display_name)}>
                  <ArrowSquareOut className="size-4 mr-2" />
                  View Profile
                </Link>
              </Button>
            )}
          </div>

          {companies[0] ? (
            <Link
              href={ROUTES.POINTSTACK_COMPANY(companies[0].slug)}
              className="flex items-start gap-3 p-4 border border-border rounded-lg hover:border-primary/30 transition-colors max-w-sm"
            >
              {companies[0].logo_url ? (
                <img
                  src={companies[0].logo_url}
                  alt={companies[0].name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">
                    {companies[0].name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium truncate">{companies[0].name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {companies[0]._memberRole || "member"}
                  </Badge>
                  {companies[0].industry && (
                    <span className="text-xs text-muted-foreground">{companies[0].industry}</span>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You&apos;re not a member of a company yet.
              </p>
              <Button asChild>
                <Link href={`${ROUTES.POINTSTACK}/companies`}>Browse Companies</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Owned Software */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Package className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Owned Software</h2>
          </div>

          {licenses.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t purchased any software yet.
              </p>
              <Button asChild>
                <Link href={ROUTES.TOOLS}>Browse Tools</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {licenses.map((license) => {
                const tool = TOOLS[license.product_id];
                return (
                  <div
                    key={license.id}
                    className="border border-border bg-card shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {tool?.name || license.product_id.toUpperCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {tool?.tagline || "Software license"}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 ${
                          license.is_active
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {license.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Key className="size-3" />
                        <span className="font-mono text-xs truncate">
                          {license.license_key.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>
                          Purchased{" "}
                          {new Date(license.purchased_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <Button size="sm" className="w-full">
                        <Download className="size-3 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Avatar Settings */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <UserCircle className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Profile Picture</h2>
          </div>

          <div className="max-w-md">
            <AvatarUpload
              currentAvatarUrl={profile?.avatar_url || null}
              displayName={profile?.display_name || null}
              onAvatarChange={(newUrl) => {
                setProfile((prev) =>
                  prev ? { ...prev, avatar_url: newUrl } : null
                );
              }}
            />
          </div>
        </div>
      </section>

      {/* Account Info */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">Account Details</h2>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={handleStartEdit}>
                <PencilSimple className="size-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mb-8 p-6 border border-border bg-card shadow-sm max-w-md">
              <h3 className="font-semibold mb-4">Edit Display Name</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => {
                      setEditDisplayName(e.target.value);
                      if (editError) setEditError("");
                    }}
                    maxLength={MAX_LENGTHS.DISPLAY_NAME}
                    placeholder="Enter display name..."
                    className="w-full px-4 py-2 bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {MIN_LENGTHS.DISPLAY_NAME}-{MAX_LENGTHS.DISPLAY_NAME} characters, letters, numbers, spaces, underscores, hyphens
                    </span>
                    <span>
                      {editDisplayName.length}/{MAX_LENGTHS.DISPLAY_NAME}
                    </span>
                  </div>
                </div>

                {editError && (
                  <div className="text-sm text-destructive">{editError}</div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    <Check className="size-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <p className="mt-1 font-mono">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Display Name
              </label>
              <p className="mt-1">{profile?.display_name || "Not set"}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Company
              </label>
              {companies[0] ? (
                <Link
                  href={ROUTES.POINTSTACK_COMPANY(companies[0].slug)}
                  className="mt-1 block hover:text-primary transition-colors"
                >
                  {companies[0].name}
                </Link>
              ) : (
                <p className="mt-1">Not set</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Member Since
              </label>
              <p className="mt-1">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
