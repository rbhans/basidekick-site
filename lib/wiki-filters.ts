import type { SortOption } from "@/components/wiki/wiki-filter-bar";

export interface WikiFilterState {
  category: string | null;
  platform: string[];
  protocol: string[];
  domain: string[];
  topic: string[];
  format: string[];
  q: string;
  sort: SortOption;
  page: number;
}

const FACET_GROUP_PARAM_MAP: Record<string, keyof Pick<WikiFilterState, "platform" | "protocol" | "domain" | "topic" | "format">> = {
  platform_vendor: "platform",
  protocol: "protocol",
  system_domain: "domain",
  topic: "topic",
  content_format: "format",
};

export const PARAM_TO_GROUP_SLUG: Record<string, string> = {
  platform: "platform_vendor",
  protocol: "protocol",
  domain: "system_domain",
  topic: "topic",
  format: "content_format",
};

const MULTI_VALUE_PARAMS = ["platform", "protocol", "domain", "topic", "format"] as const;

export function getParamNameForGroupSlug(groupSlug: string): string | null {
  return FACET_GROUP_PARAM_MAP[groupSlug] ?? null;
}

export function parseWikiFilters(searchParams: URLSearchParams): WikiFilterState {
  const state: WikiFilterState = {
    category: searchParams.get("category") || null,
    platform: [],
    protocol: [],
    domain: [],
    topic: [],
    format: [],
    q: searchParams.get("q") || "",
    sort: (searchParams.get("sort") as SortOption) || "newest",
    page: Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1),
  };

  for (const param of MULTI_VALUE_PARAMS) {
    const raw = searchParams.get(param);
    if (raw) {
      state[param] = raw.split(",").filter(Boolean);
    }
  }

  return state;
}

export function serializeWikiFilters(state: Partial<WikiFilterState>): URLSearchParams {
  const params = new URLSearchParams();

  if (state.category) params.set("category", state.category);
  if (state.q) params.set("q", state.q);
  if (state.sort && state.sort !== "newest") params.set("sort", state.sort);
  if (state.page && state.page > 1) params.set("page", String(state.page));

  for (const param of MULTI_VALUE_PARAMS) {
    const values = state[param];
    if (values && values.length > 0) {
      params.set(param, values.join(","));
    }
  }

  return params;
}

export function hasActiveFilters(state: WikiFilterState): boolean {
  return !!(
    state.category ||
    state.q ||
    state.platform.length ||
    state.protocol.length ||
    state.domain.length ||
    state.topic.length ||
    state.format.length
  );
}

/** Get all selected facet slugs from the filter state, grouped by param name */
export function getSelectedFacetSlugs(state: WikiFilterState): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const param of MULTI_VALUE_PARAMS) {
    if (state[param].length > 0) {
      result[param] = state[param];
    }
  }
  return result;
}
