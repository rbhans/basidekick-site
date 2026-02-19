import type { BabelPointConcept } from "@/lib/types";

export type BabelPointKind = "Number" | "Bool";

const BOOL_POINT_FUNCTIONS = new Set(["alarm", "status", "enable", "schedule"]);

function hasUnits(unit: BabelPointConcept["unit"]): boolean {
  if (Array.isArray(unit)) return unit.length > 0;
  return typeof unit === "string" && unit.trim().length > 0;
}

function hasBinaryStates(states: BabelPointConcept["states"]): boolean {
  if (!states) return false;
  return Object.prototype.hasOwnProperty.call(states, "0")
    && Object.prototype.hasOwnProperty.call(states, "1");
}

export function inferBabelPointKind(concept: BabelPointConcept): BabelPointKind {
  if (concept.kind === "Number" || concept.kind === "Bool") {
    return concept.kind;
  }

  if (hasUnits(concept.unit)) return "Number";
  if (hasBinaryStates(concept.states)) return "Bool";

  if (concept.point_function && BOOL_POINT_FUNCTIONS.has(concept.point_function)) {
    return "Bool";
  }

  return "Bool";
}
