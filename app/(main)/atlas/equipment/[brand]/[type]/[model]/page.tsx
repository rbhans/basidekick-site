import { Metadata } from "next";
import { notFound } from "next/navigation";
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
      title: "Model not found",
    };
  }

  const brandSlug = brandEntry.slug || brandEntry.id;
  const typeSlug = typeEntry.slug || typeEntry.id;
  const modelSlug = modelEntry.slug || modelEntry.id;
  const description =
    modelEntry.description || `${modelEntry.name} ${typeEntry.name} by ${brandEntry.name}.`;
  const canonical = `https://basidekick.com/atlas/equipment/${brandSlug}/${typeSlug}/${modelSlug}`;

  return {
    title: `${modelEntry.name}`,
    description,
    openGraph: {
      title: `${modelEntry.name}`,
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
      url: "https://basidekick.com/atlas?tab=equipment",
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

  if (!brandEntry || !typeEntry || !modelEntry) {
    notFound();
  }

  const canonical = `https://basidekick.com/atlas/equipment/${brandEntry.slug || brandEntry.id}/${typeEntry.slug || typeEntry.id}/${modelEntry.slug || modelEntry.id}`;
  const jsonLd = generateModelJsonLd(modelEntry, brandEntry, typeEntry, canonical);

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
      {
        "@type": "ListItem",
        position: 4,
        name: typeEntry.name,
        item: `https://basidekick.com/atlas/equipment/${brandEntry.slug || brandEntry.id}/${typeEntry.slug || typeEntry.id}`,
      },
      {
        "@type": "ListItem",
        position: 5,
        name: modelEntry.name,
        item: canonical,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: escapeJsonLd(breadcrumbJsonLd) }}
      />
      <EquipmentModelView brandSlug={brand} typeSlug={type} modelSlug={model} />
    </>
  );
}
