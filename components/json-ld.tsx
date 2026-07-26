import { escapeJsonLd } from "@/lib/security";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(data) }} />;
}
