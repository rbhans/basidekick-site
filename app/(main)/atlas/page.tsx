import { Suspense } from "react";
import { Metadata } from "next";
import { AtlasTabbedView } from "@/components/atlas/atlas-tabbed-view";
import { escapeJsonLd } from "@/lib/security";

const canonicalUrl = "https://basidekick.com/atlas";

const atlasSources = [
  {
    name: "Project Haystack",
    url: "https://project-haystack.org/",
  },
  {
    name: "Brick Schema",
    url: "https://brickschema.org/",
  },
  {
    name: "BACnet",
    url: "https://bacnet.org/",
  },
];

export const metadata: Metadata = {
  title: "BAS Atlas — Points & Equipment — BASidekick",
  description:
    "Open source, community-driven BAS Atlas for point naming standards and equipment catalog browsing. Actively growing with contributions.",
  openGraph: {
    title: "BAS Atlas — Points & Equipment",
    description:
      "Open source, community-driven BAS Atlas for point naming standards and equipment catalog browsing. Actively growing with contributions.",
    type: "website",
    siteName: "BASidekick",
    url: canonicalUrl,
  },
  alternates: {
    canonical: canonicalUrl,
  },
};

function generateAtlasJsonLd() {
  const datasetId = `${canonicalUrl}#dataset`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: "BAS Atlas",
        description: metadata.description,
        isPartOf: {
          "@id": "https://basidekick.com/#website",
        },
        about: [
          "BAS point naming standards",
          "building automation equipment catalog",
          "Project Haystack tags",
          "Brick Schema classes",
          "vendor point aliases",
        ],
        citation: atlasSources.map((source) => source.url),
        mainEntity: {
          "@id": datasetId,
        },
      },
      {
        "@type": "Dataset",
        "@id": datasetId,
        name: "BAS Atlas point and equipment reference",
        description:
          "Community-curated BAS point and equipment reference covering point aliases, vendor spellings, Project Haystack tag strings, Brick classes, and equipment catalog entries.",
        url: canonicalUrl,
        keywords: [
          "BAS point naming",
          "building automation point names",
          "equipment catalog",
          "Project Haystack",
          "Brick Schema",
          "BACnet",
        ],
        creator: {
          "@id": "https://basidekick.com/#organization",
        },
        isBasedOn: atlasSources.map((source) => ({
          "@type": "CreativeWork",
          name: source.name,
          url: source.url,
        })),
      },
    ],
  };
}

export default function AtlasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(generateAtlasJsonLd()),
        }}
      />
      <h1 className="sr-only">BAS Atlas</h1>
      <section
        aria-labelledby="atlas-answer-summary"
        className="container mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-16 pt-10"
      >
        <div className="border-y border-foreground py-5">
          <div className="grid gap-5 md:grid-cols-[1.1fr_1fr_1fr]">
            <div>
              <h2
                id="atlas-answer-summary"
                className="font-mono text-[10px] uppercase tracking-[1.4px] text-accent"
              >
                What BAS Atlas answers
              </h2>
              <p className="mt-2 text-[14px] leading-[1.55] text-foreground">
                BAS Atlas is the BASidekick reference for translating point names,
                vendor aliases, equipment labels, Haystack tags, and Brick classes.
              </p>
            </div>
            <p className="text-[13px] leading-[1.5] text-muted-foreground">
              Use it when you need a point naming reference for common BAS objects,
              abbreviations, aliases, and tag strings across vendors.
            </p>
            <p className="text-[13px] leading-[1.5] text-muted-foreground">
              Use the equipment catalog to browse BAS equipment types, brands, models,
              and typical points without treating any single vendor naming style as canon.
            </p>
          </div>
        </div>
      </section>
      <Suspense fallback={<div className="min-h-full" />}>
        <AtlasTabbedView />
      </Suspense>
    </>
  );
}
