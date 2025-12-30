"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { License, Profile } from "@/lib/types";
import { TOOLS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import {
  User,
  Package,
  SignOut,
  Download,
  Key,
  Calendar,
  Buildings,
  SignIn,
} from "@phosphor-icons/react";

export function AccountView() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch profile and licenses in parallel
      const [profileRes, licensesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("licenses").select("*").eq("user_id", user.id),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
      }

      if (licensesRes.data) {
        setLicenses(licensesRes.data as License[]);
      }

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

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="min-h-full">
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>account</SectionLabel>

            <h1 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight">
              Sign In Required
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Sign in or create an account to view your purchases, access the forum, and manage your profile.
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
          </div>
        </section>
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
      <section className="relative py-12 overflow-hidden">
        <CircuitBackground opacity={0.15} />
        <div className="container mx-auto px-4 relative z-10">
          <SectionLabel>account</SectionLabel>

          <div className="mt-6 flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {profile?.display_name || "Your Account"}
              </h1>
              <p className="mt-1 text-muted-foreground">{user?.email}</p>
              {profile?.company && (
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                  <Buildings className="size-3" />
                  {profile.company}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <SignOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </div>
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
                    className="border border-border bg-card p-6"
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

      {/* Account Info */}
      <section className="py-8 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <User className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Account Details</h2>
          </div>

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
              <p className="mt-1">{profile?.company || "Not set"}</p>
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
