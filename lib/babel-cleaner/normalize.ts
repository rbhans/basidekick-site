import type { BabelEquipmentEntry } from "@/lib/types";
import type { AbbreviationsData } from "./types";

/**
 * Build a regex to strip equipment prefixes from point names.
 * Matches patterns like: AHU-1., VAV2_, FCU_03-, RTU3., B1-, etc.
 */
export function buildEquipmentPrefixRegex(equipment: BabelEquipmentEntry[]): RegExp {
  const prefixes = new Set<string>();

  for (const equip of equipment) {
    if (equip.abbreviation) {
      prefixes.add(equip.abbreviation.toLowerCase());
    }
    // Also add common aliases that look like equipment abbreviations (2-5 chars, no spaces)
    for (const alias of equip.aliases.common) {
      const lower = alias.toLowerCase();
      if (lower.length >= 2 && lower.length <= 5 && !/\s/.test(lower)) {
        prefixes.add(lower);
      }
    }
  }

  // Sort longest first to match greedily
  const sorted = Array.from(prefixes).sort((a, b) => b.length - a.length);
  const escaped = sorted.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = `^((?:${escaped.join("|")})\\s*[-_.]?\\s*\\d*\\s*[-_.]\\s*)`;

  return new RegExp(pattern, "i");
}

/**
 * Strip an equipment prefix from a point name.
 * Returns the stripped prefix and remaining name.
 */
export function stripEquipmentPrefix(
  name: string,
  prefixRegex: RegExp,
): { prefix: string | null; remainder: string } {
  const match = name.match(prefixRegex);
  if (match) {
    return {
      prefix: match[1].trim(),
      remainder: name.slice(match[1].length),
    };
  }
  return { prefix: null, remainder: name };
}

/**
 * Normalize delimiters and casing in a point name.
 * Splits on dots, underscores, hyphens, and camelCase boundaries.
 */
export function normalizeDelimiters(name: string): string {
  return (
    name
      // Split camelCase: "ZoneTemp" -> "Zone Temp"
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Split number boundaries: "AHU1" -> "AHU 1", "3Fan" -> "3 Fan"
      .replace(/([a-zA-Z])(\d)/g, "$1 $2")
      .replace(/(\d)([a-zA-Z])/g, "$1 $2")
      // Replace delimiters with spaces
      .replace(/[._\-\/]+/g, " ")
      // Collapse multiple spaces
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
}

/**
 * Full normalization pipeline for a raw point name.
 */
export function normalizeName(
  rawName: string,
  prefixRegex: RegExp,
): { normalizedName: string; strippedPrefix: string | null } {
  const trimmed = rawName.trim();
  const { prefix, remainder } = stripEquipmentPrefix(trimmed, prefixRegex);
  const normalizedName = normalizeDelimiters(remainder);

  return { normalizedName, strippedPrefix: prefix };
}

/**
 * Expand a token using abbreviation mappings.
 * Returns all possible expansions for a given token.
 */
export function expandToken(
  token: string,
  abbreviationsData: AbbreviationsData,
): string[] {
  const expansions = new Set<string>([token]);

  // Check abbreviations (word -> abbreviations)
  const abbrevs = abbreviationsData.abbreviations[token];
  if (abbrevs) {
    for (const a of abbrevs) {
      expansions.add(a);
    }
  }

  // Check verbose expansions (abbreviation -> full words)
  const verbose = abbreviationsData.verboseExpansions[token];
  if (verbose) {
    for (const v of verbose) {
      expansions.add(v);
      // Also add individual words from multi-word expansions
      for (const word of v.split(" ")) {
        expansions.add(word);
      }
    }
  }

  // Check reverse: if token is an abbreviation of something
  for (const [word, abbrevList] of Object.entries(abbreviationsData.abbreviations)) {
    if (abbrevList.includes(token)) {
      expansions.add(word);
    }
  }

  return Array.from(expansions);
}
