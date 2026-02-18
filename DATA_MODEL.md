# Website Data Model Notes

## Upstream Sources
- BAS Babel: `dist/index.json`, `dist/templates.json`, `dist/graph.json`
- BAS Atlas: `dist/index.json`

## Local Types
Type definitions are in `lib/types.ts` and include additive fields for:
- Babel point concept normalization metadata
- Babel alias variants
- Babel equipment concept metadata
- Template and graph artifacts

## Compatibility
The website API remains additive and does not replace current static data consumers.
