import { Metadata } from "next";
import { notFound } from "next/navigation";
import { EquipmentBrandView } from "@/components/atlas/equipment-brand-view";
import { escapeJsonLd } from "@/lib/security";
import { getAllBrandSlugs, getAtlasBrand } from "@/lib/data/atlas";

export const revalidate = 86400;

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
      title: "Brand not found",
    };
  }

  const brandSlug = brandEntry.slug || brandEntry.id;
  const description = brandEntry.description || `Explore ${brandEntry.name} equipment in BAS Atlas.`;
  const canonical = `https://basidekick.com/atlas/equipment/${brandSlug}`;

  return {
    title: `${brandEntry.name} Equipment`,
    description,
    openGraph: {
      title: `${brandEntry.name} Equipment`,
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
  const brandEntry = await getAtlasBrand(brand);

  if (!brandEntry) {
    notFound();
  }

  const breadcrumbJsonLd = {
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(breadcrumbJsonLd) }}
      />
      <EquipmentBrandView brandSlug={brand} />
    </>
  );
}
