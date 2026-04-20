import { Metadata } from "next";
import { EquipmentTypeView } from "@/components/atlas/equipment-type-view";
import { escapeJsonLd } from "@/lib/security";
import { getAllTypeSlugs, getAtlasBrand, getAtlasType } from "@/lib/data/atlas";

export const revalidate = 86400;

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
      title: "Type not found — BASidekick",
    };
  }

  const brandSlug = brandEntry.slug || brandEntry.id;
  const typeSlug = typeEntry.slug || typeEntry.id;
  const description =
    typeEntry.description || `Browse ${typeEntry.name} models from ${brandEntry.name} in BAS Atlas.`;
  const canonical = `https://basidekick.com/atlas/equipment/${brandSlug}/${typeSlug}`;

  return {
    title: `${brandEntry.name} ${typeEntry.name} — BASidekick`,
    description,
    openGraph: {
      title: `${brandEntry.name} ${typeEntry.name} — BASidekick`,
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
  const [brandEntry, typeEntry] = await Promise.all([
    getAtlasBrand(brand),
    getAtlasType(brand, type),
  ]);

  const breadcrumbJsonLd = brandEntry && typeEntry
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://basidekick.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "BAS Atlas",
            item: "https://basidekick.com/atlas?tab=equipment",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: brandEntry.name,
            item: `https://basidekick.com/atlas/equipment/${brandEntry.slug || brandEntry.id}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: typeEntry.name,
            item: `https://basidekick.com/atlas/equipment/${brandEntry.slug || brandEntry.id}/${typeEntry.slug || typeEntry.id}`,
          },
        ],
      }
    : null;

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(breadcrumbJsonLd) }}
        />
      )}
      <EquipmentTypeView brandSlug={brand} typeSlug={type} />
    </>
  );
}
