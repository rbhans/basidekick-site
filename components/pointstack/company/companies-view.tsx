"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlass, MapPin, Users, Plus, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold">Companies</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Discover BAS companies and organizations.
          </p>
        </div>
        {user && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies..."
          className="w-full h-11 bg-card border border-border rounded-xl pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-[#3F3F46] transition-colors"
        />
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center gap-3 p-6 mb-6 border border-border rounded-xl bg-card text-center">
          <WarningCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchCompanies()}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      )}

      {/* Companies grid */}
      {!loading && companies.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={ROUTES.POINTSTACK_COMPANY(company.slug)}
              className="block p-4 border border-border rounded-xl bg-card hover:border-[#3F3F46] transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {company.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{company.name}</h3>
                  {company.industry && (
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                  )}
                </div>
                {company.is_verified && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
              </div>

              {company.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {company.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {company.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.size_range && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{company.size_range}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && companies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search ? "No companies found matching your search." : "No companies yet."}
          </p>
        </div>
      )}

      <CreateCompanyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={async (company) => {
          router.push(ROUTES.POINTSTACK_COMPANY(company.slug));
        }}
      />
    </div>
  );
}
