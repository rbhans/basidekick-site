import { Metadata } from "next";
import { EquipmentTypeView } from "@/components/atlas/equipment-type-view";
import { getAllTypeSlugs, getAtlasBrand, getAtlasType } from "@/lib/data/atlas";

export const revalidate = 3600;

interface TypePageProps {
  params: Promise<{ brand: string; type: string }>;
}

export async function generateStaticParams() {
  const entries = await getAllTypeSlugs();
  return entries.map((entry) => ({ brand: entry.brand, type: entry.type }));
}

export async function generateMetadata({ params }: TypePageProps): Promise<Metadata> {
  const { brand, type } = await params;
  const [brandEntry, typeEntry] = await Promise.all([
    getAtlasBrand(brand),
    getAtlasType(brand, type),
  ]);

  if (!brandEntry || !typeEntry) {
    return {
      title: "Type Not Found | BAS Atlas",
    };
  }

  const brandSlug = brandEntry.slug || brandEntry.id;
  const typeSlug = typeEntry.slug || typeEntry.id;
  const description =
    typeEntry.description || `Browse ${typeEntry.name} models from ${brandEntry.name} in BAS Atlas.`;
  const canonical = `https://basidekick.com/equipment/${brandSlug}/${typeSlug}`;

  return {
    title: `${brandEntry.name} ${typeEntry.name} | BASidekick Atlas`,
    description,
    openGraph: {
      title: `${brandEntry.name} ${typeEntry.name} - BASidekick Atlas`,
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

export default async function TypePage({ params }: TypePageProps) {
  const { brand, type } = await params;
  return <EquipmentTypeView brandSlug={brand} typeSlug={type} />;
}
