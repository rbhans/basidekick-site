import type { Metadata } from "next";
import { ReferencesView } from "@/components/views/references-view";
import { escapeJsonLd } from "@/lib/security";

const canonicalUrl = "https://basidekick.com/references";

const referenceSources = [
  {
    name: "BACnet object enum",
    url: "https://reference.opcfoundation.org/specs/OPC-30030/10.4",
  },
  {
    name: "BACnet overview",
    url: "https://bacnet.org/wp-content/uploads/sites/4/2022/06/The-Language-of-BACnet-1.pdf",
  },
  {
    name: "Modbus Application Protocol",
    url: "https://modbus.org/docs/Modbus_Application_Protocol_V1_1b3.pdf",
  },
  {
    name: "ASHRAE psychrometrics",
    url: "https://handbook.ashrae.org/Handbooks/F25/SI/F25_Ch01/F25_Ch01_si.aspx",
  },
  {
    name: "BAPI thermistor overview",
    url: "https://www.bapihvac.com/thermistor-overview/",
  },
];

const referenceSections = [
  "BACnet object types",
  "BACnet command priorities",
  "Modbus function codes",
  "Modbus exception codes",
  "Common BAS signals",
  "Control loop terms",
  "Psychrometric values",
  "Valve and damper terms",
  "Electrical field terms",
  "Network abbreviations",
  "Commissioning terms",
];

export const metadata: Metadata = {
  title: "BAS References — BASidekick",
  description:
    "Quick building automation reference sheets for BAS terms, protocols, wiring, electrical concepts, and field work.",
  alternates: { canonical: canonicalUrl },
};

function generateReferencesJsonLd() {
  const itemListId = `${canonicalUrl}#reference-sections`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: "BAS References",
        description: metadata.description,
        isPartOf: {
          "@id": "https://basidekick.com/#website",
        },
        about: [
          "building automation reference",
          "BACnet object types",
          "BACnet priority array",
          "Modbus function codes",
          "BAS signal types",
          "psychrometric field values",
        ],
        citation: referenceSources.map((source) => source.url),
        mainEntity: {
          "@id": itemListId,
        },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "BAS quick reference sections",
        numberOfItems: referenceSections.length,
        itemListElement: referenceSections.map((section, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: section,
          url: canonicalUrl,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What BAS protocol references are on this page?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The BAS References page includes BACnet object types, BACnet command priorities, Modbus function codes, and Modbus exception codes.",
            },
          },
          {
            "@type": "Question",
            name: "What field checks are included?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The page includes common BAS signals, control loop terms, psychrometric values, valve and damper terms, electrical terms, network abbreviations, and commissioning terms.",
            },
          },
        ],
      },
    ],
  };
}

export default function ReferencesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(generateReferencesJsonLd()),
        }}
      />
      <h1 className="sr-only">BAS References</h1>
      <ReferencesView />
    </>
  );
}
