import { Metadata } from "next";
import { EquipmentModelView } from "@/components/atlas/equipment-model-view";
import { escapeJsonLd } from "@/lib/security";
import {
  getAllModelSlugs,
  getAtlasBrand,
  getAtlasModel,
  getAtlasType,
} from "@/lib/data/atlas";
import type { AtlasBrand, AtlasModel, AtlasType } from "@/lib/types";

export const revalidate = 86400;

interface ModelPageProps {
  params: Promise<{ brand: string; type: string; model: string }>;
}

export async function generateStaticParams() {
  const entries = await getAllModelSlugs();
  return entries.map((entry) => ({
    brand: entry.brand,
    type: entry.type,
    model: entry.model,
  }));
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { brand, type, model } = await params;
  const [brandEntry, typeEntry, modelEntry] = await Promise.all([
    getAtlasBrand(brand),
    getAtlasType(brand, type),
    getAtlasModel(brand, type, model),
  ]);

  if (!brandEntry || !typeEntry || !modelEntry) {
    return {
      title: "Model Not Found | BAS Atlas",
    };
  }

  const brandSlug = brandEntry.slug || brandEntry.id;
  const typeSlug = typeEntry.slug || typeEntry.id;
  const modelSlug = modelEntry.slug || modelEntry.id;
  const description =
    modelEntry.description || `${modelEntry.name} ${typeEntry.name} by ${brandEntry.name}.`;
  const canonical = `https://basidekick.com/equipment/${brandSlug}/${typeSlug}/${modelSlug}`;

  return {
    title: `${modelEntry.name} | BASidekick Atlas`,
    description,
    openGraph: {
      title: `${modelEntry.name} - BASidekick Atlas`,
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

function generateModelJsonLd(
  model: AtlasModel,
  brand: AtlasBrand,
  type: AtlasType,
  canonical: string
) {
  const description = model.description || `${brand.name} ${type.name} model.`;
  const additionalProperty = [
    { "@type": "PropertyValue", name: "Brand", value: brand.name },
    { "@type": "PropertyValue", name: "Type", value: type.name },
    model.model_numbers?.length
      ? { "@type": "PropertyValue", name: "Model Numbers", value: model.model_numbers.join(", ") }
      : null,
    model.protocols?.length
      ? { "@type": "PropertyValue", name: "Protocols", value: model.protocols.join(", ") }
      : null,
    model.status
      ? { "@type": "PropertyValue", name: "Status", value: model.status }
      : null,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: model.name,
    description,
    identifier: model.id,
    termCode: model.id,
    url: canonical,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "BAS Atlas",
      url: "https://basidekick.com/equipment",
    },
    additionalProperty: additionalProperty.length ? additionalProperty : undefined,
  };
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { brand, type, model } = await params;
  const [brandEntry, typeEntry, modelEntry] = await Promise.all([
    getAtlasBrand(brand),
    getAtlasType(brand, type),
    getAtlasModel(brand, type, model),
  ]);

  const canonical = brandEntry && typeEntry && modelEntry
    ? `https://basidekick.com/equipment/${brandEntry.slug || brandEntry.id}/${typeEntry.slug || typeEntry.id}/${modelEntry.slug || modelEntry.id}`
    : null;
  const jsonLd =
    brandEntry && typeEntry && modelEntry && canonical
      ? generateModelJsonLd(modelEntry, brandEntry, typeEntry, canonical)
      : null;

  const breadcrumbJsonLd =
    brandEntry && typeEntry && modelEntry
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
              name: "Equipment",
              item: "https://basidekick.com/equipment",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: brandEntry.name,
              item: `https://basidekick.com/equipment/${brandEntry.slug || brandEntry.id}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: typeEntry.name,
              item: `https://basidekick.com/equipment/${brandEntry.slug || brandEntry.id}/${typeEntry.slug || typeEntry.id}`,
            },
            {
              "@type": "ListItem",
              position: 5,
              name: modelEntry.name,
              item: canonical,
            },
          ],
        }
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: escapeJsonLd(breadcrumbJsonLd) }}
        />
      )}
      <EquipmentModelView brandSlug={brand} typeSlug={type} modelSlug={model} />
    </>
  );
}
