import type { BabelData, BabelPointEntry } from "@/lib/types";
import type { AbbreviationsData, CleanerRow, MatchCandidate } from "./types";
import { buildEquipmentPrefixRegex, normalizeName, expandToken } from "./normalize";

const MAX_ALTERNATES = 3;

/**
 * Build a lookup map from alias string -> point entries for fast exact matching.
 */
function buildAliasIndex(points: BabelPointEntry[]): Map<string, BabelPointEntry[]> {
  const index = new Map<string, BabelPointEntry[]>();

  for (const point of points) {
    const keys = [
      point.concept.name.toLowerCase(),
      point.concept.id.toLowerCase(),
      point.concept.id.replace(/-/g, " "),
      ...point.aliases.common.map((a) => a.toLowerCase()),
      ...(point.aliases.misspellings || []).map((a) => a.toLowerCase()),
    ];

    if (point.concept.haystack) {
      keys.push(point.concept.haystack.toLowerCase());
    }

    for (const key of keys) {
      const existing = index.get(key);
      if (existing) {
        existing.push(point);
      } else {
        index.set(key, [point]);
      }
    }
  }

  return index;
}

/**
 * Build a token set for each point for fuzzy matching.
 */
function buildPointTokenSets(points: BabelPointEntry[]): Map<string, Set<string>> {
  const tokenSets = new Map<string, Set<string>>();

  for (const point of points) {
    const tokens = new Set<string>();

    // Add name words
    for (const word of point.concept.name.toLowerCase().split(/\s+/)) {
      tokens.add(word);
    }

    // Add ID segments
    for (const seg of point.concept.id.split("-")) {
      tokens.add(seg);
    }

    // Add all alias tokens
    for (const alias of point.aliases.common) {
      const lower = alias.toLowerCase();
      tokens.add(lower);
      for (const word of lower.split(/[\s-]+/)) {
        tokens.add(word);
      }
    }

    tokenSets.set(point.concept.id, tokens);
  }

  return tokenSets;
}

/**
 * Score how well input tokens match a point's token set, using abbreviation expansion.
 */
function scoreTokenMatch(
  inputTokens: string[],
  pointTokens: Set<string>,
  abbreviationsData: AbbreviationsData,
): number {
  if (inputTokens.length === 0) return 0;

  let matchedCount = 0;

  for (const token of inputTokens) {
    // Skip numbers (likely equipment identifiers, not point descriptors)
    if (/^\d+$/.test(token)) continue;

    const expansions = expandToken(token, abbreviationsData);
    const matched = expansions.some((exp) => {
      // Exact match
      if (pointTokens.has(exp)) return true;
      // Check if expansion is a substring of any point token or vice versa
      for (const pt of pointTokens) {
        if (pt.length >= 3 && exp.length >= 3) {
          if (pt.includes(exp) || exp.includes(pt)) return true;
        }
      }
      return false;
    });

    if (matched) matchedCount++;
  }

  // Filter out number tokens for the denominator too
  const meaningfulTokens = inputTokens.filter((t) => !/^\d+$/.test(t));
  if (meaningfulTokens.length === 0) return 0;

  return matchedCount / meaningfulTokens.length;
}

function scoreToConfidence(score: number): MatchCandidate["confidence"] {
  if (score >= 1.0) return "high";
  if (score >= 0.7) return "medium";
  if (score >= 0.4) return "low";
  return "none";
}

/**
 * Match a single normalized point name against the BabelData.
 */
function matchSinglePoint(
  normalizedName: string,
  aliasIndex: Map<string, BabelPointEntry[]>,
  pointTokenSets: Map<string, Set<string>>,
  allPoints: BabelPointEntry[],
  abbreviationsData: AbbreviationsData,
): { bestMatch: MatchCandidate | null; alternateMatches: MatchCandidate[] } {
  if (!normalizedName.trim()) {
    return { bestMatch: null, alternateMatches: [] };
  }

  // Pass 1: Exact alias match
  const exactMatches = aliasIndex.get(normalizedName);
  if (exactMatches && exactMatches.length > 0) {
    const best = exactMatches[0];
    const bestCandidate: MatchCandidate = {
      pointId: best.concept.id,
      pointName: best.concept.name,
      score: 1.0,
      confidence: "high",
      matchedVia: `exact alias: "${normalizedName}"`,
    };

    const alternates = exactMatches.slice(1, MAX_ALTERNATES + 1).map((p) => ({
      pointId: p.concept.id,
      pointName: p.concept.name,
      score: 1.0,
      confidence: "high" as const,
      matchedVia: `exact alias: "${normalizedName}"`,
    }));

    return { bestMatch: bestCandidate, alternateMatches: alternates };
  }

  // Also try without spaces (e.g., "supplyairtemp" matching "supply air temp")
  const noSpaces = normalizedName.replace(/\s+/g, "");
  const noSpaceMatches = aliasIndex.get(noSpaces);
  if (noSpaceMatches && noSpaceMatches.length > 0) {
    const best = noSpaceMatches[0];
    return {
      bestMatch: {
        pointId: best.concept.id,
        pointName: best.concept.name,
        score: 0.95,
        confidence: "high",
        matchedVia: `concatenated alias: "${noSpaces}"`,
      },
      alternateMatches: noSpaceMatches.slice(1, MAX_ALTERNATES + 1).map((p) => ({
        pointId: p.concept.id,
        pointName: p.concept.name,
        score: 0.95,
        confidence: "high" as const,
        matchedVia: `concatenated alias: "${noSpaces}"`,
      })),
    };
  }

  // Pass 2: Token-based scoring
  const inputTokens = normalizedName.split(/\s+/).filter((t) => t.length > 0);
  const scored: { point: BabelPointEntry; score: number }[] = [];

  for (const point of allPoints) {
    const pointTokens = pointTokenSets.get(point.concept.id);
    if (!pointTokens) continue;

    const score = scoreTokenMatch(inputTokens, pointTokens, abbreviationsData);
    if (score > 0.3) {
      scored.push({ point, score });
    }
  }

  // Sort by score descending, then by name length ascending (prefer more specific)
  scored.sort((a, b) => {
    if (Math.abs(a.score - b.score) > 0.05) return b.score - a.score;
    return a.point.concept.name.length - b.point.concept.name.length;
  });

  if (scored.length === 0) {
    return { bestMatch: null, alternateMatches: [] };
  }

  const best = scored[0];
  const confidence = scoreToConfidence(best.score);

  // If confidence is none, don't return a match
  if (confidence === "none") {
    return { bestMatch: null, alternateMatches: [] };
  }

  const bestCandidate: MatchCandidate = {
    pointId: best.point.concept.id,
    pointName: best.point.concept.name,
    score: best.score,
    confidence,
    matchedVia: `token scoring (${Math.round(best.score * 100)}%)`,
  };

  const alternates = scored.slice(1, MAX_ALTERNATES + 1).map((s) => ({
    pointId: s.point.concept.id,
    pointName: s.point.concept.name,
    score: s.score,
    confidence: scoreToConfidence(s.score),
    matchedVia: `token scoring (${Math.round(s.score * 100)}%)`,
  }));

  return { bestMatch: bestCandidate, alternateMatches: alternates };
}

/**
 * Match all point names in a batch, yielding progress.
 */
export async function matchAllPoints(
  pointNames: string[],
  data: BabelData,
  abbreviationsData: AbbreviationsData,
  onProgress?: (progress: number) => void,
): Promise<CleanerRow[]> {
  const prefixRegex = buildEquipmentPrefixRegex(data.equipment);
  const aliasIndex = buildAliasIndex(data.points);
  const pointTokenSets = buildPointTokenSets(data.points);

  const results: CleanerRow[] = [];
  const CHUNK_SIZE = 50;

  for (let i = 0; i < pointNames.length; i += CHUNK_SIZE) {
    const chunk = pointNames.slice(i, i + CHUNK_SIZE);

    for (let j = 0; j < chunk.length; j++) {
      const rawName = chunk[j];
      const { normalizedName, strippedPrefix } = normalizeName(rawName, prefixRegex);

      const { bestMatch, alternateMatches } = matchSinglePoint(
        normalizedName,
        aliasIndex,
        pointTokenSets,
        data.points,
        abbreviationsData,
      );

      results.push({
        rowIndex: i + j,
        originalName: rawName,
        normalizedName,
        strippedPrefix,
        bestMatch,
        alternateMatches,
        userOverride: null,
        flaggedAsNew: false,
      });
    }

    // Yield to the event loop between chunks for large files
    if (pointNames.length > CHUNK_SIZE) {
      const progress = Math.min(((i + CHUNK_SIZE) / pointNames.length) * 100, 100);
      onProgress?.(progress);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  onProgress?.(100);
  return results;
}
