import type {
  AtlasData,
  BabelData,
  BabelGraphData,
  BabelPointEntry,
  BabelTemplatesData,
} from "@/lib/types";

type NormalizeResult = {
  matchedConceptId: string | null;
  confidence: number;
  matchType: "exact" | "alias" | "token" | "ngram" | "none";
  normalizedName: string;
  suggestedHaystackTags: string[];
};

type ValidateResult = {
  matched: Array<{ input: string; pointId: string; confidence: number }>;
  missingRequired: string[];
  missingRecommended: string[];
  unknown: string[];
  suggestions: Array<{ input: string; candidates: Array<{ pointId: string; confidence: number }> }>;
};

type SearchResult = {
  id: string;
  type: "point" | "equipment";
  name: string;
  score: number;
};

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._/\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(input: string): string {
  return normalizeText(input).replace(/[^a-z0-9]/g, "");
}

function tokenize(input: string): string[] {
  return normalizeText(input)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function tokenScore(inputTokens: string[], candidateTokens: string[]): number {
  if (inputTokens.length === 0 || candidateTokens.length === 0) return 0;

  const candidateSet = new Set(candidateTokens);
  let score = 0;

  for (const token of inputTokens) {
    if (candidateSet.has(token)) {
      score += 1;
      continue;
    }

    const partial = candidateTokens.some((candidate) =>
      token.length >= 3 && candidate.length >= 3
        ? candidate.includes(token) || token.includes(candidate)
        : false,
    );

    if (partial) {
      score += 0.6;
    }
  }

  return score / Math.max(inputTokens.length, 1);
}

function pointAliases(point: BabelPointEntry): string[] {
  return dedupe([
    point.concept.id,
    point.concept.name,
    ...(point.aliases.common || []),
    ...(point.aliases.misspellings || []),
    ...(point.aliases.variants || []).map((variant) => variant.value),
  ]);
}

export function normalizePointName(name: string, data: BabelData): NormalizeResult {
  const normalizedName = normalizeText(name);
  if (!normalizedName) {
    return {
      matchedConceptId: null,
      confidence: 0,
      matchType: "none",
      normalizedName,
      suggestedHaystackTags: [],
    };
  }

  const compactInput = compactText(normalizedName);
  const inputTokens = tokenize(normalizedName);

  let bestMatch: {
    pointId: string;
    score: number;
    matchType: NormalizeResult["matchType"];
    tags: string[];
  } | null = null;

  for (const point of data.points) {
    const aliases = pointAliases(point);
    const normalizedAliases = aliases.map((alias) => normalizeText(alias));
    const compactAliases = normalizedAliases.map((alias) => compactText(alias));

    let score = 0;
    let matchType: NormalizeResult["matchType"] = "none";

    if (compactText(point.concept.id) === compactInput || normalizeText(point.concept.id) === normalizedName) {
      score = 1;
      matchType = "exact";
    } else if (compactText(point.concept.name) === compactInput || normalizeText(point.concept.name) === normalizedName) {
      score = 0.98;
      matchType = "exact";
    } else if (compactAliases.includes(compactInput)) {
      const nameScore = tokenScore(inputTokens, tokenize(point.concept.name));
      score = 0.93 + nameScore * 0.05;
      matchType = "alias";
    } else {
      const candidateTokens = dedupe(
        normalizedAliases.flatMap((alias) => tokenize(alias)).concat(point.concept.tags?.haystack || []),
      );
      const rawScore = tokenScore(inputTokens, candidateTokens);
      if (rawScore >= 0.5) {
        score = rawScore * 0.82;
        matchType = "token";
      } else {
        score = rawScore * 0.65;
        matchType = "ngram";
      }
    }

    if (inputTokens.includes("setpoint") || inputTokens.includes("sp")) {
      if (point.concept.type === "setpoint") {
        score += 0.04;
      }
    } else if (inputTokens.includes("temp") || inputTokens.includes("temperature")) {
      if (point.concept.type === "sensor") {
        score += 0.03;
      } else if (point.concept.type === "setpoint") {
        score -= 0.05;
      }
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        pointId: point.concept.id,
        score,
        matchType,
        tags: point.concept.tags?.haystack || [],
      };
    }
  }

  if (!bestMatch || bestMatch.score < 0.35) {
    return {
      matchedConceptId: null,
      confidence: bestMatch?.score || 0,
      matchType: "none",
      normalizedName,
      suggestedHaystackTags: [],
    };
  }

  return {
    matchedConceptId: bestMatch.pointId,
    confidence: Number(bestMatch.score.toFixed(4)),
    matchType: bestMatch.matchType,
    normalizedName,
    suggestedHaystackTags: bestMatch.tags,
  };
}

function findPointCandidates(
  input: string,
  data: BabelData,
  maxCandidates = 3,
): Array<{ pointId: string; confidence: number }> {
  const inputTokens = tokenize(input);

  return data.points
    .map((point) => {
      const candidateTokens = dedupe([
        ...tokenize(point.concept.id),
        ...tokenize(point.concept.name),
        ...(point.aliases.common || []).flatMap((alias) => tokenize(alias)),
        ...(point.aliases.variants || []).flatMap((variant) => tokenize(variant.value)),
      ]);

      return {
        pointId: point.concept.id,
        confidence: Number(tokenScore(inputTokens, candidateTokens).toFixed(4)),
      };
    })
    .filter((candidate) => candidate.confidence > 0.2)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxCandidates);
}

function resolveEquipmentTypeId(input: string, data: BabelData): string {
  const compact = compactText(input);

  for (const equipment of data.equipment) {
    const candidates = dedupe([
      equipment.id,
      equipment.name,
      equipment.abbreviation || "",
      ...(equipment.aliases.common || []),
    ]);

    if (candidates.some((candidate) => compactText(candidate) === compact)) {
      return equipment.id;
    }
  }

  return input;
}

export function validatePointList(
  equipmentTypeId: string,
  points: string[],
  data: BabelData,
  templatesData: BabelTemplatesData,
): ValidateResult {
  const resolvedEquipmentTypeId = resolveEquipmentTypeId(equipmentTypeId, data);
  const template = templatesData.templates.find((entry) => entry.equipmentTypeId === resolvedEquipmentTypeId);

  if (!template) {
    return {
      matched: [],
      missingRequired: [],
      missingRecommended: [],
      unknown: points,
      suggestions: points.map((input) => ({ input, candidates: findPointCandidates(input, data) })),
    };
  }

  const pointIds = new Set(data.points.map((point) => point.concept.id));
  const matched: ValidateResult["matched"] = [];
  const unknown: string[] = [];
  const suggestions: ValidateResult["suggestions"] = [];
  const matchedPointIds = new Set<string>();

  for (const input of points) {
    const normalized = normalizeText(input);

    if (pointIds.has(normalized)) {
      matched.push({ input, pointId: normalized, confidence: 1 });
      matchedPointIds.add(normalized);
      continue;
    }

    const normalizedResult = normalizePointName(input, data);
    if (normalizedResult.matchedConceptId && normalizedResult.confidence >= 0.45) {
      matched.push({
        input,
        pointId: normalizedResult.matchedConceptId,
        confidence: normalizedResult.confidence,
      });
      matchedPointIds.add(normalizedResult.matchedConceptId);
      continue;
    }

    unknown.push(input);
    suggestions.push({
      input,
      candidates: findPointCandidates(input, data),
    });
  }

  return {
    matched,
    missingRequired: template.requiredPoints.filter((pointId) => !matchedPointIds.has(pointId)),
    missingRecommended: template.recommendedPoints.filter((pointId) => !matchedPointIds.has(pointId)),
    unknown,
    suggestions,
  };
}

export function searchBabel(data: BabelData, query: string): SearchResult[] {
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(normalizedQuery);

  const results: SearchResult[] = [];

  for (const point of data.points) {
    const tokens = dedupe([
      ...tokenize(point.concept.id),
      ...tokenize(point.concept.name),
      ...(point.aliases.common || []).flatMap((alias) => tokenize(alias)),
      ...(point.aliases.variants || []).flatMap((variant) => tokenize(variant.value)),
    ]);

    const score = tokenScore(queryTokens, tokens);
    if (score > 0.2) {
      results.push({
        id: point.concept.id,
        type: "point",
        name: point.concept.name,
        score,
      });
    }
  }

  for (const equipment of data.equipment) {
    const tokens = dedupe([
      ...tokenize(equipment.id),
      ...tokenize(equipment.name),
      ...tokenize(equipment.abbreviation || ""),
      ...(equipment.aliases.common || []).flatMap((alias) => tokenize(alias)),
    ]);

    const score = tokenScore(queryTokens, tokens);
    if (score > 0.2) {
      results.push({
        id: equipment.id,
        type: "equipment",
        name: equipment.name,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 50);
}

export function searchAtlas(
  data: AtlasData,
  query: string,
): Array<{ id: string; type: "brand" | "type" | "model"; name: string; score: number }> {
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenize(normalizedQuery);
  const results: Array<{ id: string; type: "brand" | "type" | "model"; name: string; score: number }> = [];

  for (const brand of data.brands) {
    const tokens = dedupe([...tokenize(brand.id), ...tokenize(brand.name), ...tokenize(brand.slug)]);
    const score = tokenScore(queryTokens, tokens);
    if (score > 0.2) {
      results.push({ id: brand.id, type: "brand", name: brand.name, score });
    }
  }

  for (const type of data.types) {
    const tokens = dedupe([...tokenize(type.id), ...tokenize(type.name), ...tokenize(type.slug)]);
    const score = tokenScore(queryTokens, tokens);
    if (score > 0.2) {
      results.push({ id: type.id, type: "type", name: type.name, score });
    }
  }

  for (const model of data.models) {
    const tokens = dedupe([
      ...tokenize(model.id),
      ...tokenize(model.name),
      ...tokenize(model.slug),
      ...(model.model_numbers || []).flatMap((value) => tokenize(value)),
      ...(model.protocols || []).flatMap((value) => tokenize(value)),
    ]);
    const score = tokenScore(queryTokens, tokens);
    if (score > 0.2) {
      results.push({ id: model.id, type: "model", name: model.name, score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 50);
}

export function relatedPoints(graph: BabelGraphData, pointId: string, relTypes?: string[]): string[] {
  const relFilter = relTypes ? new Set(relTypes) : null;
  const outgoing = graph.adjacency[pointId] || [];

  return outgoing
    .filter((edge) => (relFilter ? relFilter.has(edge.rel) : true))
    .map((edge) => edge.to)
    .sort((a, b) => a.localeCompare(b));
}

export function traverseGraph(
  graph: BabelGraphData,
  startId: string,
  options?: { depth?: number; relTypes?: string[] },
): string[] {
  const maxDepth = Math.min(Math.max(options?.depth || 2, 1), 5);
  const relFilter = options?.relTypes ? new Set(options.relTypes) : null;

  const visited = new Set<string>([startId]);
  const output = new Set<string>();
  const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current.depth >= maxDepth) continue;

    for (const edge of graph.adjacency[current.id] || []) {
      if (relFilter && !relFilter.has(edge.rel)) continue;
      if (visited.has(edge.to)) continue;

      visited.add(edge.to);
      output.add(edge.to);
      queue.push({ id: edge.to, depth: current.depth + 1 });
    }
  }

  return [...output].sort((a, b) => a.localeCompare(b));
}
