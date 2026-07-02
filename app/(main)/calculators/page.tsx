import type { Metadata } from "next";
import { CalculatorsView } from "@/components/views/calculators-view";
import { escapeJsonLd } from "@/lib/security";

const canonicalUrl = "https://basidekick.com/calculators";

const priorityCalculators = [
  {
    name: "Analog Input Scaling",
    anchor: "analog-input-scaling-calculator",
    description:
      "Scale 4-20 mA, voltage, or raw BAS input values into engineering units.",
  },
  {
    name: "Air Changes per Hour",
    anchor: "air-changes-per-hour-calculator",
    description:
      "Calculate ACH from airflow in CFM and room volume in cubic feet.",
  },
  {
    name: "Mixed Air Temperature",
    anchor: "mixed-air-temperature-calculator",
    description:
      "Estimate mixed air temperature from outdoor air, return air, and outdoor air fraction.",
  },
  {
    name: "IP Subnet Calculator",
    anchor: "ip-subnet-calculator",
    description:
      "Check usable hosts and host ranges for BAS VLAN and controller network planning.",
  },
  {
    name: "BTU from Flow",
    anchor: "btu-from-flow-calculator",
    description:
      "Estimate hydronic heat transfer from GPM and temperature difference.",
  },
  {
    name: "Duct Static Setpoint",
    anchor: "duct-static-setpoint-calculator",
    description:
      "Estimate duct static reset setpoints using design CFM, design static pressure, and actual CFM.",
  },
  {
    name: "Airflow Unit Conversion",
    anchor: "airflow-cfm-conversion-calculator",
    description: "Convert between CFM, L/s, and cubic meters per hour.",
  },
];

const calculatorFaq = [
  {
    question: "How do you calculate air changes per hour?",
    answer:
      "ACH = CFM x 60 / room volume. Room volume is length x width x height in cubic feet.",
  },
  {
    question: "How do you calculate hydronic BTU from flow?",
    answer:
      "BTU/hr = GPM x Delta T x 500 for water. Adjust the constant for glycol or unusual fluid properties.",
  },
  {
    question: "How do you estimate a duct static reset setpoint?",
    answer:
      "Use the fan-law square relationship: adjusted static = design static x (actual CFM / design CFM)^2.",
  },
  {
    question: "What BAS calculator should I use for controller network planning?",
    answer:
      "Use the IP subnet calculator to check usable host counts and host ranges before assigning BAS controller addresses.",
  },
];

export const metadata: Metadata = {
  title: "BAS Calculators for CFM, BTU, Duct Static",
  description:
    "Free HVAC and building automation calculators for CFM, ACH, hydronic BTU, duct static reset, sensor scaling, subnet planning, and field checks.",
  alternates: { canonical: canonicalUrl },
};

function generateCalculatorsJsonLd() {
  const itemListId = `${canonicalUrl}#calculator-list`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: "BAS Calculators",
        description: metadata.description,
        isPartOf: {
          "@id": "https://basidekick.com/#website",
        },
        about: [
          "building automation calculators",
          "CFM calculator",
          "ACH calculator",
          "BTU from flow",
          "duct static reset",
          "BAS network planning",
        ],
        mainEntity: {
          "@id": itemListId,
        },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "BAS calculator tools",
        numberOfItems: priorityCalculators.length,
        itemListElement: priorityCalculators.map((calculator, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "WebApplication",
            "@id": `${canonicalUrl}#${calculator.anchor}`,
            name: calculator.name,
            description: calculator.description,
            url: `${canonicalUrl}#${calculator.anchor}`,
            applicationCategory: "EngineeringApplication",
            operatingSystem: "Web browser",
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: calculatorFaq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export default function CalculatorsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: escapeJsonLd(generateCalculatorsJsonLd()),
        }}
      />
      <h1 className="sr-only">BAS Calculators</h1>
      <CalculatorsView />
    </>
  );
}
