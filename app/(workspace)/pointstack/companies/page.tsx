import { PointStackView, type PointStackCompanyItem } from "@/components/feature-pages";
import { fetchCompanies } from "@/lib/pointstack-api";
import { createServerReadClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  let items: PointStackCompanyItem[] = [];
  try {
    const companies = await fetchCompanies(await createServerReadClient());
    items = companies.map((company) => ({
      slug: company.slug,
      name: company.name,
      description: company.description ?? "A company represented in the PointStack community.",
      location: company.location ?? "BAS community",
      industry: company.industry ?? "Building automation",
      verified: company.is_verified,
    }));
  } catch {}
  return <PointStackView mode="companies" initialCompanies={items.length ? items : undefined} />;
}
