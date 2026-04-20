import { Metadata } from "next";
import Link from "next/link";
import { BabelEntryPageClient } from "@/components/babel/babel-entry-page-client";
import { escapeJsonLd } from "@/lib/security";
import { getAllBabelIds, getBabelEntry, type BabelEntryLookup } from "@/lib/data/babel";
import type { BabelEquipmentEntry, BabelPointEntry } from "@/lib/types";
import { ROUTES } from "@/lib/routes";

const BASE_URL = "https://basidekick.com";

export const revalidate = 86400;

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
      title: "Entry not found — BASidekick",
    };
  }

  const name = entry.type === "point"
    ? (entry.data as BabelPointEntry).concept.name
    : (entry.data as BabelEquipmentEntry).name;
  const description = entry.type === "point"
    ? (entry.data as BabelPointEntry).concept.description
    : (entry.data as BabelEquipmentEntry).description;
  const fallbackDescription = `BAS Atlas ${entry.type} definition for ${name}.`;
  const canonical = `${BASE_URL}/atlas/${id}`;

  return {
    title: `${name} — BASidekick`,
    description: description || fallbackDescription,
    openGraph: {
      title: `${name} — BASidekick`,
      description: description || fallbackDescription,
      type: "website",
      siteName: "BASidekick",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — BASidekick`,
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
        ? { "@type": "PropertyValue", name: "Haystack", value: pointEntry.concept.haystack.tagString }
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
        name: "BAS Atlas",
        url: `${BASE_URL}/atlas`,
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
      ? { "@type": "PropertyValue", name: "Haystack", value: equipmentEntry.haystack.tagString }
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
      name: "BAS Atlas",
      url: `${BASE_URL}/atlas`,
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
            The entry &quot;{id}&quot; doesn&apos;t exist in BAS Atlas.
          </p>
        </div>
      </div>
    );
  }

  const canonical = `${BASE_URL}/atlas/${id}`;
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
        name: "BAS Atlas",
        item: `${BASE_URL}/atlas`,
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
        {/* Title block strip */}
        <div className="title-block">
          <div className="field">
            <span className="field-label">Drawing</span>
            <span className="field-value">Atlas</span>
          </div>
          <div className="field">
            <span className="field-label">Sheet</span>
            <span className="field-value truncate max-w-[260px]">{id}</span>
          </div>
          <div className="field">
            <span className="field-label">Type</span>
            <span className="field-value">{entry.type === "point" ? "Point" : "Equipment"}</span>
          </div>
          <div className="field hidden md:flex">
            <span className="field-label">Title</span>
            <span className="field-value truncate max-w-[320px]">{name}</span>
          </div>
          <div className="spacer" />
          <div className="field">
            <span className="field-label">Drawn by</span>
            <span className="field-value">R.H.</span>
          </div>
        </div>

        {/* Back link */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 pt-5 max-w-[880px]">
          <Link
            href={ROUTES.ATLAS}
            className="font-mono text-[11px] uppercase tracking-[1.2px] text-muted-foreground hover:text-accent transition-colors"
          >
            <span className="text-accent mr-1.5">←</span>
            Back to Atlas
          </Link>
        </div>

        {/* Content */}
        <section className="py-8 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-16 max-w-[880px]">
            <BabelEntryPageClient entry={entry.data} type={entry.type} />
          </div>
        </section>
      </div>
    </>
  );
}
