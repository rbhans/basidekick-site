"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlass, MapPin, Users, Plus, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackCompany } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { CreateCompanyDialog } from "./create-company-dialog";
import * as api from "../pointstack-api";

export function PointStackCompaniesView() {
  const router = useRouter();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<PointStackCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchCompanies(search || undefined);
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      void fetchCompanies();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchCompanies]);

  return (
    <section className="container mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-16 py-10">
      {/* Section heading */}
      <div className="flex items-baseline gap-3.5 pb-3.5 border-b border-foreground mb-6">
        <span className="font-mono text-[11px] text-accent tracking-[1px]">01 /</span>
        <h1 className="font-heading font-semibold text-[26px] leading-none text-foreground">
          Companies
        </h1>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[1.2px] text-muted-foreground tabular-nums">
          {companies.length} {companies.length === 1 ? "company" : "companies"}
        </span>
        {user && (
          <button
            onClick={() => setCreateDialogOpen(true)}
            className="ml-3 font-mono text-[10px] uppercase tracking-[1.2px] text-foreground hover:text-accent transition-colors inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add company
          </button>
        )}
      </div>

      <p className="font-heading italic text-[15px] text-muted-foreground mb-7">
        BAS companies and organizations — the shops behind the names you see on job sites.
      </p>

      {/* Search */}
      <div className="relative border border-border rounded-md bg-card focus-within:border-foreground transition-colors mb-8">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, industry, or location…"
          className="w-full bg-transparent border-none outline-none font-sans text-[14px] text-foreground placeholder:text-muted-foreground/60 placeholder:italic py-3 pl-11 pr-4"
          aria-label="Search companies"
        />
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="p-6 mb-6 border border-border rounded-md bg-card text-center">
          <WarningCircle className="w-7 h-7 text-destructive mx-auto mb-2" />
          <p className="font-heading italic text-[16px] mb-1">Something went wrong.</p>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchCompanies()}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[48px_1fr_60px] gap-4 items-start py-4 px-2 border-b border-muted">
              <Skeleton className="h-12 w-12 rounded-sm" />
              <div>
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-full max-w-md mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-3 w-12 self-center" />
            </div>
          ))}
        </div>
      )}

      {/* Companies list */}
      {!loading && companies.length > 0 && (
        <div className="space-y-0">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={ROUTES.POINTSTACK_COMPANY(company.slug)}
              className="group grid grid-cols-[48px_1fr_auto] gap-4 items-start py-4 px-2 border-b border-muted hover:bg-muted/40 transition-colors"
            >
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-12 h-12 rounded-sm object-cover border border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-sm bg-muted flex items-center justify-center border border-border font-mono text-[16px] font-bold text-foreground">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-heading font-semibold text-[17px] leading-[1.25] text-foreground group-hover:text-accent transition-colors">
                    {company.name}
                  </h3>
                  {company.is_verified && (
                    <span className="font-mono text-[9px] uppercase tracking-[1px] text-accent border border-accent px-1.5 py-0.5 rounded-sm">
                      Verified
                    </span>
                  )}
                </div>
                {company.industry && (
                  <p className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground mt-0.5">
                    {company.industry}
                  </p>
                )}
                {company.description && (
                  <p className="text-[13px] text-muted-foreground leading-[1.5] mt-1 line-clamp-1 max-w-[640px]">
                    {company.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground flex-wrap">
                  {company.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {company.location}
                    </span>
                  )}
                  {company.size_range && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {company.size_range}
                    </span>
                  )}
                </div>
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[1.1px] text-muted-foreground group-hover:text-accent transition-colors self-center">
                View →
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && companies.length === 0 && !error && (
        <div className="py-20 text-center font-heading italic text-[18px] text-muted-foreground">
          {search ? `No companies match "${search}".` : "No companies yet."}
        </div>
      )}

      <CreateCompanyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={async (company) => {
          router.push(ROUTES.POINTSTACK_COMPANY(company.slug));
        }}
      />
    </section>
  );
}
