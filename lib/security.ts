/**
 * Security utilities for input sanitization and safe data handling
 */

const MAX_SEARCH_QUERY_LENGTH = 200;

/**
 * Escape string for safe inclusion in JSON-LD script tags
 * Prevents script tag injection via </script> sequences
 */
export function escapeJsonLd(obj: unknown): string {
  const json = JSON.stringify(obj);
  // Escape </script> sequences that could break out of JSON-LD
  return json
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<!--/g, "<\\!--");
}

/**
 * Sanitize search input for use in Supabase ILIKE queries within .or() filters.
 * Escapes PostgreSQL LIKE special characters (%, _, \) and strips
 * PostgREST filter grammar characters (commas, parentheses, dots) that
 * would break .or() filter parsing.
 */
export function sanitizeSearchInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Trim and limit length
  let sanitized = input.trim().slice(0, MAX_SEARCH_QUERY_LENGTH);

  // Escape PostgreSQL LIKE special characters
  sanitized = sanitized
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/%/g, "\\%")   // Escape percent signs
    .replace(/_/g, "\\_");  // Escape underscores

  // Strip PostgREST filter grammar characters that break .or() parsing
  sanitized = sanitized.replace(/[,()]/g, " ");

  // Remove any null bytes or control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

  // Collapse multiple spaces from stripping
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  return sanitized;
}
