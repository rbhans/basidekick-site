import { Metadata } from "next";
import { EquipmentBrandView } from "@/components/atlas/equipment-brand-view";
import { getAllBrandSlugs, getAtlasBrand } from "@/lib/data/atlas";

export const revalidate = 3600;

interface BrandPageProps {
  params: Promise<{ brand: string }>;
}

export async function generateStaticParams() {
  const brands = await getAllBrandSlugs();
  return brands.map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { brand } = await params;
  const brandEntry = await getAtlasBrand(brand);

  if (!brandEntry) {
    return {
      title: "Brand Not Found | BAS Atlas",
    };
  }

  const brandSlug = brandEntry.slug || brandEntry.id;
  const description = brandEntry.description || `Explore ${brandEntry.name} equipment in BAS Atlas.`;
  const canonical = `https://basidekick.com/equipment/${brandSlug}`;

  return {
    title: `${brandEntry.name} Equipment | BASidekick Atlas`,
    description,
    openGraph: {
      title: `${brandEntry.name} Equipment - BASidekick Atlas`,
      description,
      type: "website",
      siteName: "BASidekick",
      url: canonical,
    },
    alternates: {
      canonical,
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { brand } = await params;
  return <EquipmentBrandView brandSlug={brand} />;
}
