"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlass, MapPin, Users, Plus } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/routes";
import { PointStackCompany } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import * as api from "../pointstack-api";

export function PointStackCompaniesView() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<PointStackCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const data = await api.fetchCompanies(search || undefined);
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Companies</h1>
          <p className="text-muted-foreground">
            Discover BAS companies and organizations in the community.
          </p>
        </div>
        {user && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies..."
          className="pl-9"
        />
      </div>

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
              className="block p-4 border border-border rounded-lg hover:border-primary/30 transition-colors"
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
    </div>
  );
}
