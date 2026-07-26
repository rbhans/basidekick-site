import { describe, expect, it } from "vitest";
import { fetchWikiArticles } from "@/lib/wiki-api";
import type { SupabaseClient } from "@/lib/supabase/client";

describe("fetchWikiArticles", () => {
  it("supports the complete lightweight Wiki index without fetching article bodies", async () => {
    const observed: { table?: string; select?: string; range?: [number, number] } = {};
    const query = {
      select(columns: string) {
        observed.select = columns;
        return this;
      },
      eq() {
        return this;
      },
      order() {
        return this;
      },
      range(from: number, to: number) {
        observed.range = [from, to];
        return Promise.resolve({ data: [], count: 451, error: null });
      },
    };
    const client = {
      from(table: string) {
        observed.table = table;
        return query;
      },
    } as unknown as SupabaseClient;

    const result = await fetchWikiArticles(
      client,
      { category: null, platform: [], protocol: [], domain: [], topic: [], format: [], q: "", sort: "newest", page: 1 },
      1,
      1000,
    );

    expect(observed.table).toBe("wiki_articles");
    expect(observed.select).not.toContain("*");
    expect(observed.select).not.toContain("content");
    expect(observed.range).toEqual([0, 999]);
    expect(result.count).toBe(451);
  });
});
