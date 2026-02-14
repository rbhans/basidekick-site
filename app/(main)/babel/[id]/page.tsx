import { Metadata } from "next";
import { SectionLabel } from "@/components/section-label";
import { CircuitBackground } from "@/components/circuit-background";
import { BabelEntryPageClient } from "@/components/babel/babel-entry-page-client";
import { escapeJsonLd } from "@/lib/security";
import { getAllBabelIds, getBabelEntry, type BabelEntryLookup } from "@/lib/data/babel";
import type { BabelEquipmentEntry, BabelPointEntry } from "@/lib/types";

const BASE_URL = "https://basidekick.com";

export const revalidate = 3600;

interface BabelEntryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const ids = await getAllBabelIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: BabelEntryPageProps): Promise<Metadata> {
  const { id } = await params;
  const entry = await getBabelEntry(id);

  if (!entry) {
    return {
      title: "Entry Not Found | BAS Babel",
    };
  }

  const name = entry.type === "point"
    ? (entry.data as BabelPointEntry).concept.name
    : (entry.data as BabelEquipmentEntry).name;
  const description = entry.type === "point"
    ? (entry.data as BabelPointEntry).concept.description
    : (entry.data as BabelEquipmentEntry).description;
  const fallbackDescription = `BAS Babel ${entry.type} definition for ${name}.`;
  const canonical = `${BASE_URL}/babel/${id}`;

  return {
    title: `${name} | BAS Babel`,
    description: description || fallbackDescription,
    openGraph: {
      title: `${name} - BAS Babel`,
      description: description || fallbackDescription,
      type: "website",
      siteName: "BASidekick",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - BAS Babel`,
      description: description || fallbackDescription,
    },
    alternates: {
      canonical,
    },
  };
}

function generateBabelJsonLd(entry: BabelEntryLookup, canonical: string) {
  if (entry.type === "point") {
    const pointEntry = entry.data as BabelPointEntry;
    const additionalProperty = [
      pointEntry.concept.haystack
        ? { "@type": "PropertyValue", name: "Haystack", value: pointEntry.concept.haystack }
        : null,
      pointEntry.concept.brick
        ? { "@type": "PropertyValue", name: "Brick", value: pointEntry.concept.brick }
        : null,
      pointEntry.concept.unit
        ? { "@type": "PropertyValue", name: "Unit", value: pointEntry.concept.unit }
        : null,
    ].filter(Boolean);

    return {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: pointEntry.concept.name,
      description: pointEntry.concept.description,
      identifier: pointEntry.concept.id,
      termCode: pointEntry.concept.id,
      url: canonical,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: "BAS Babel",
        url: `${BASE_URL}/babel`,
      },
      additionalProperty: additionalProperty.length ? additionalProperty : undefined,
    };
  }

  const equipmentEntry = entry.data as BabelEquipmentEntry;
  const additionalProperty = [
    equipmentEntry.category
      ? { "@type": "PropertyValue", name: "Category", value: equipmentEntry.category }
      : null,
    equipmentEntry.haystack
      ? { "@type": "PropertyValue", name: "Haystack", value: equipmentEntry.haystack }
      : null,
    equipmentEntry.brick
      ? { "@type": "PropertyValue", name: "Brick", value: equipmentEntry.brick }
      : null,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: equipmentEntry.name,
    description: equipmentEntry.description,
    identifier: equipmentEntry.id,
    termCode: equipmentEntry.id,
    url: canonical,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "BAS Babel",
      url: `${BASE_URL}/babel`,
    },
    additionalProperty: additionalProperty.length ? additionalProperty : undefined,
  };
}

export default async function BabelEntryPage({ params }: BabelEntryPageProps) {
  const { id } = await params;
  const entry = await getBabelEntry(id);

  if (!entry) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Entry not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            The entry &quot;{id}&quot; doesn&apos;t exist in BAS Babel.
          </p>
        </div>
      </div>
    );
  }

  const canonical = `${BASE_URL}/babel/${id}`;
  const jsonLd = generateBabelJsonLd(entry, canonical);
  const name = entry.type === "point"
    ? (entry.data as BabelPointEntry).concept.name
    : (entry.data as BabelEquipmentEntry).name;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "BAS Babel",
        item: `${BASE_URL}/babel`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name,
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
      <div className="min-h-full">
        {/* Header */}
        <section className="relative py-12 overflow-hidden">
          <CircuitBackground opacity={0.15} colorGradient />
          <div className="container mx-auto px-4 relative z-10">
            <SectionLabel>bas babel</SectionLabel>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <BabelEntryPageClient entry={entry.data} type={entry.type} />
          </div>
        </section>
      </div>
    </>
  );
}
