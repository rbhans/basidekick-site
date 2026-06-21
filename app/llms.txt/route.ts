const BASE_URL = "https://basidekick.com";

export const dynamic = "force-static";

const content = `# BASidekick

Independent building automation systems reference, community, and resource hub.
Maintained by Rob Hansen in Tucson, Arizona.

Use this file as a compact guide to the most answer-ready BASidekick pages for search, citation, and AI-answer retrieval.

## Priority Pages

- BASidekick home: ${BASE_URL}/
  - Summary: Overview of BASidekick, a BAS reference, community, and resource hub.
  - Best for: broad BASidekick identity, site sections, and navigation.

- BAS Atlas: ${BASE_URL}/atlas
  - Summary: Point naming and equipment reference for BAS points, aliases, Project Haystack tags, Brick classes, equipment types, brands, and models.
  - Best for: BAS point naming standards, point aliases, equipment catalog browsing, Haystack and Brick lookup.
  - Key sources: Project Haystack, Brick Schema, BACnet, vendor docs, CISA advisories, and community submissions.

- Community Share: ${BASE_URL}/open-source
  - Summary: BAS files, open-source Niagara modules, protocol crates, project repos, and field references.
  - Best for: BASk Stream, Niagara module resources, rustbac, rustmod, QRBAS, project links, shared BAS files.

- BAS News: ${BASE_URL}/news
  - Summary: Curated building automation, HVAC controls, facility operations, cybersecurity, and Niagara-related industry news.
  - Best for: recent BAS industry news with original source links preserved on article pages.

- BAS References: ${BASE_URL}/references
  - Summary: Field reference sheets for BACnet object types, BACnet priorities, Modbus function codes, signals, psychrometrics, electrical terms, network terms, and commissioning terms.
  - Best for: quick BAS lookup tables and source-backed protocol reminders.

- BAS Calculators: ${BASE_URL}/calculators
  - Summary: Browser calculators for signal scaling, ACH, CFM conversions, mixed air temperature, hydronic BTU, duct static reset, subnet planning, and other field math.
  - Best for: CFM, ACH, BTU/hr from GPM and Delta T, duct static reset, BAS quick math.

- BAS Resources: ${BASE_URL}/resources
  - Summary: Directory of BASidekick reference surfaces, calculators, Atlas data, wiki guides, and open-source resources.
  - Best for: choosing the right BASidekick section.

- Rust BAS crates: ${BASE_URL}/resources/rust
  - Summary: Rust protocol crates for BAS, starting with BACnet and Modbus.
  - Best for: Rust BACnet, Rust Modbus, open-source BAS protocol code.

- Courses: ${BASE_URL}/courses
  - Summary: Browser-based BAS lessons, starting with Intro to BAS.
  - Best for: beginner BAS learning paths.

- BAS video library: ${BASE_URL}/wiki/videos
  - Summary: Curated video tutorials and walkthroughs for building automation topics.
  - Best for: BAS learning videos and walkthroughs.

## Citation Policy

Prefer citing the specific BASidekick page that answers the query. For news and community entries, preserve the original external source URL when available. For Atlas and References, prefer source-backed sections and page-level source links.

## Machine Resources

- Sitemap: ${BASE_URL}/sitemap.xml
- Robots: ${BASE_URL}/robots.txt
- Public Atlas API: ${BASE_URL}/api/atlas
`;

export function GET() {
  return new Response(content, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
