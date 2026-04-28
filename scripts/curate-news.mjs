#!/usr/bin/env node
/**
 * BASidekick News Curator
 *
 * Usage:
 *   node scripts/curate-news.mjs
 *   node scripts/curate-news.mjs --dry-run --limit=5
 *
 * Optional env:
 *   SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_KEY / SUPABASE_SERVICE_ROLE_KEY
 *   NEWS_LOOKBACK_DAYS
 *   NEWS_RETIRE_AFTER_DAYS
 *   NEWS_DEDUPE_DAYS
 *   NEWS_PER_FEED_LIMIT
 *
 * This script reuses the existing public.news_articles table and service-role
 * insertion path. The existing `is_ai_submitted` flag remains the automation
 * bucket for non-user-submitted articles.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

const SOURCE_FEEDS = [
  {
    name: "AutomatedBuildings",
    url: "https://www.automatedbuildings.com/feed/",
    strategy: "all",
    defaultTags: ["controls", "smart-building"],
  },
  {
    name: "Facilities Dive",
    url: "https://www.facilitiesdive.com/feeds/news/",
    strategy: "keyword",
    defaultTags: ["energy", "hvac"],
  },
];

const RELEVANCE_PATTERNS = [
  /\bbuilding automation\b/i,
  /\bsmart building(?:s)?\b/i,
  /\bbuilding management system(?:s)?\b/i,
  /\bbms\b/i,
  /\bbas\b/i,
  /\bbacnet\b/i,
  /\bniagara\b/i,
  /\bhvac\b/i,
  /\bheat pump(?:s)?\b/i,
  /\belectrification\b/i,
  /\bcommissioning\b/i,
  /\bload[- ]shifting\b/i,
  /\benergy demand\b/i,
  /\benergy management\b/i,
  /\bopenblue\b/i,
  /\bmetasys\b/i,
  /\bchiller\b/i,
];

const TAG_RULES = [
  ["bacnet", /\bbacnet\b/i],
  ["niagara", /\bniagara\b/i],
  ["controls", /\bcontrols?\b|\bbms\b|\bbas\b/i],
  ["smart-building", /\bsmart building(?:s)?\b|\bbuilding automation\b/i],
  ["analytics", /\banalytics?\b|\boptimization\b|\bfault detection\b/i],
  ["ai", /\bai\b|artificial intelligence|machine learning/i],
  ["hvac", /\bhvac\b|heat pump|chiller|cooling/i],
  ["energy", /\benergy\b|electrification|demand|efficiency/i],
  ["retrofit", /\bretrofit\b|renovation\b/i],
  ["iot", /\biot\b|internet of things/i],
  ["security", /\bcyber\b|\bsecurity\b/i],
];

const ENTITY_MAP = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  ndash: "-",
  mdash: "-",
  quot: '"',
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  hellip: "...",
};

function loadLocalEnv() {
  for (const name of [".env.local", ".env"]) {
    const filePath = resolve(REPO_ROOT, name);
    if (!existsSync(filePath)) continue;
    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;

      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;

      let value = rawValue.trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t");
    }
  }
}

function parseNumber(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    lookbackDays: parseNumber(process.env.NEWS_LOOKBACK_DAYS, 3),
    retireAfterDays: parseNumber(process.env.NEWS_RETIRE_AFTER_DAYS, 7),
    dedupeDays: parseNumber(process.env.NEWS_DEDUPE_DAYS, 30),
    limit: parseNumber(process.env.NEWS_PER_FEED_LIMIT, 8),
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--lookback-days=")) {
      options.lookbackDays = parseNumber(arg.split("=")[1], options.lookbackDays);
      continue;
    }

    if (arg.startsWith("--retire-after-days=")) {
      options.retireAfterDays = parseNumber(arg.split("=")[1], options.retireAfterDays);
      continue;
    }

    if (arg.startsWith("--dedupe-days=")) {
      options.dedupeDays = parseNumber(arg.split("=")[1], options.dedupeDays);
      continue;
    }

    if (arg.startsWith("--limit=")) {
      options.limit = parseNumber(arg.split("=")[1], options.limit);
    }
  }

  return options;
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function stripCdata(value) {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, digits) => String.fromCodePoint(Number.parseInt(digits, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITY_MAP[name.toLowerCase()] ?? match);
}

function stripHtml(value) {
  return normalizeWhitespace(decodeHtmlEntities(value.replace(/<[^>]+>/g, " ")));
}

function truncate(value, maxLength = 280) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function extractTagValue(block, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, "i");
  const match = block.match(pattern);
  if (!match) return null;
  return stripCdata(match[1]).trim();
}

function parseLink(block) {
  const direct = extractTagValue(block, "link");
  if (direct) return direct;

  const atomMatch = block.match(/<link\b[^>]*href="([^"]+)"[^>]*\/?>/i);
  return atomMatch?.[1] ?? null;
}

export function parseFeedItems(xml) {
  const itemPattern = /<item\b[\s\S]*?<\/item>/gi;
  const entryPattern = /<entry\b[\s\S]*?<\/entry>/gi;
  const blocks = xml.match(itemPattern) ?? xml.match(entryPattern) ?? [];

  return blocks.map((block) => ({
    title: stripHtml(extractTagValue(block, "title") ?? ""),
    link: parseLink(block),
    description: extractTagValue(block, "description") ?? extractTagValue(block, "summary") ?? "",
    pubDate: extractTagValue(block, "pubDate") ?? extractTagValue(block, "updated"),
    guid: extractTagValue(block, "guid") ?? extractTagValue(block, "id"),
  }));
}

export function canonicalizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  const junkParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "oc",
    "ref",
    "fbclid",
    "gclid",
  ];
  for (const key of junkParams) url.searchParams.delete(key);
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
}

export function extractPrimaryUrl(rawUrl) {
  const url = new URL(rawUrl);
  const redirectUrl = url.searchParams.get("url");
  if (redirectUrl) return canonicalizeUrl(decodeURIComponent(redirectUrl));
  return canonicalizeUrl(rawUrl);
}

function parsePublishedAt(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractDomain(rawUrl) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function inferTags(text, defaultTags = []) {
  const tags = new Set(defaultTags);

  for (const [tag, pattern] of TAG_RULES) {
    if (pattern.test(text)) tags.add(tag);
  }

  return Array.from(tags).slice(0, 5);
}

function isRelevantItem(feed, text) {
  if (feed.strategy === "all") return true;
  return RELEVANCE_PATTERNS.some((pattern) => pattern.test(text));
}

function buildSlug(title, url) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
  const suffix = createHash("sha1").update(url).digest("hex").slice(0, 8);
  return `${base}-${suffix}`;
}

export function buildFeedArticles(feed, items, { lookbackDays, limit, now = new Date() }) {
  const cutoff = now.getTime() - lookbackDays * 24 * 60 * 60 * 1000;
  const deduped = new Map();

  for (const item of items) {
    const linkCandidate = item.link ?? item.guid;
    if (!linkCandidate) continue;

    let url;
    try {
      url = extractPrimaryUrl(linkCandidate);
    } catch {
      continue;
    }

    const publishedAt = parsePublishedAt(item.pubDate);
    if (publishedAt && publishedAt.getTime() < cutoff) continue;

    const title = normalizeWhitespace(item.title ?? "");
    if (!title) continue;

    const summary = truncate(stripHtml(item.description ?? ""));
    const searchText = `${title} ${summary}`.trim();
    if (!isRelevantItem(feed, searchText)) continue;

    if (deduped.has(url)) continue;

    deduped.set(url, {
      title,
      url,
      slug: buildSlug(title, url),
      source_domain: extractDomain(url),
      summary: summary || null,
      tags: inferTags(searchText, feed.defaultTags),
      published_at: (publishedAt ?? now).toISOString(),
    });

    if (deduped.size >= limit) break;
  }

  return Array.from(deduped.values());
}

async function fetchFeedXml(feed) {
  const response = await fetch(feed.url, {
    headers: {
      "user-agent": "BASidekickNewsBot/1.0 (+https://basidekick.com)",
      accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

export async function collectFeedArticles(options) {
  const articles = [];
  const sourceSummaries = [];

  for (const feed of SOURCE_FEEDS) {
    try {
      const xml = await fetchFeedXml(feed);
      const items = parseFeedItems(xml);
      const built = buildFeedArticles(feed, items, options);
      articles.push(...built);
      sourceSummaries.push({
        source: feed.name,
        fetched: items.length,
        kept: built.length,
      });
    } catch (error) {
      sourceSummaries.push({
        source: feed.name,
        fetched: 0,
        kept: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const deduped = new Map();
  for (const article of articles) {
    if (!deduped.has(article.url)) deduped.set(article.url, article);
  }

  return {
    articles: Array.from(deduped.values()),
    sourceSummaries,
  };
}

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

async function retireStaleArticles(supabase, retireAfterDays) {
  console.log(
    `\n📤 Step 1: Retiring machine-curated articles older than ${retireAfterDays} days...`
  );

  const cutoff = new Date(Date.now() - retireAfterDays * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("news_articles")
    .update({ is_published: false, updated_at: new Date().toISOString() })
    .eq("is_ai_submitted", true)
    .eq("is_published", true)
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    console.error("  ❌ Error retiring articles:", error.message);
    return 0;
  }

  const retiredCount = data?.length ?? 0;
  console.log(`  ✅ Retired ${retiredCount} stale articles`);
  return retiredCount;
}

async function getExistingUrls(supabase, dedupeDays) {
  console.log(`\n🔍 Step 2: Fetching existing article URLs from the last ${dedupeDays} days...`);

  const { data, error } = await supabase
    .from("news_articles")
    .select("url")
    .gt("created_at", new Date(Date.now() - dedupeDays * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error("  ❌ Error fetching URLs:", error.message);
    return new Set();
  }

  const urls = new Set(
    data
      .map((row) => row.url)
      .filter((url) => typeof url === "string")
      .map((url) => {
        try {
          return canonicalizeUrl(url);
        } catch {
          return url;
        }
      })
  );

  console.log(`  ✅ Found ${urls.size} existing URLs`);
  return urls;
}

async function insertArticles(supabase, articles, existingUrls, { dryRun }) {
  console.log("\n📥 Step 3-4: Processing feed candidates...");
  const inserted = [];
  const skipped = [];

  for (const article of articles) {
    if (existingUrls.has(article.url)) {
      skipped.push({ ...article, reason: "duplicate URL" });
      console.log(`  ⏭️  Skipped (duplicate): ${article.title}`);
      continue;
    }

    if (dryRun) {
      inserted.push(article);
      console.log(`  🧪 Dry run candidate: ${article.title}`);
      continue;
    }

    const { error } = await supabase.from("news_articles").upsert(
      {
        title: article.title,
        url: article.url,
        slug: article.slug,
        source_domain: article.source_domain,
        summary: article.summary,
        submitted_by: null,
        is_ai_submitted: true,
        tags: article.tags,
        is_published: true,
        published_at: article.published_at,
      },
      { onConflict: "url", ignoreDuplicates: true }
    );

    if (error) {
      skipped.push({ ...article, reason: error.message });
      console.error(`  ❌ Failed to insert "${article.title}":`, error.message);
      continue;
    }

    inserted.push(article);
    console.log(`  ✅ Inserted: ${article.title}`);
  }

  return { inserted, skipped };
}

async function getActiveAutomationCount(supabase) {
  const { count, error } = await supabase
    .from("news_articles")
    .select("*", { count: "exact", head: true })
    .eq("is_ai_submitted", true)
    .eq("is_published", true);

  if (error) {
    console.error("  ❌ Error counting active automated articles:", error.message);
    return "?";
  }

  return count;
}

export async function runCurator(argv = process.argv.slice(2)) {
  loadLocalEnv();
  const options = parseArgs(argv);
  const supabase = getSupabaseClient();

  if (!supabase && !options.dryRun) {
    console.error(
      "❌ Missing required env vars: SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  console.log(`BASidekick News Curator — ${new Date().toISOString()}`);
  console.log("=".repeat(60));
  console.log(
    `Mode: ${options.dryRun ? "dry-run" : "write"} | Lookback: ${options.lookbackDays}d | Per-feed limit: ${options.limit}`
  );

  const retiredCount =
    supabase && !options.dryRun ? await retireStaleArticles(supabase, options.retireAfterDays) : 0;
  const existingUrls = supabase ? await getExistingUrls(supabase, options.dedupeDays) : new Set();

  console.log("\n🛰️  Step 3: Fetching source feeds...");
  const { articles, sourceSummaries } = await collectFeedArticles(options);
  for (const source of sourceSummaries) {
    const status = source.error ? `error: ${source.error}` : `${source.kept}/${source.fetched} kept`;
    console.log(`  • ${source.source}: ${status}`);
  }

  const { inserted, skipped } = await insertArticles(supabase, articles, existingUrls, options);
  const activeCount = supabase && !options.dryRun ? await getActiveAutomationCount(supabase) : "n/a";

  console.log("\n" + "=".repeat(60));
  console.log("📊 CURATION REPORT");
  console.log("=".repeat(60));
  console.log(`\n📤 Articles retired:    ${retiredCount}`);
  console.log(`🧠 Feed candidates:     ${articles.length}`);
  console.log(`📈 Active auto articles:${String(activeCount).padStart(5, " ")}`);

  console.log(`\n✅ Articles ${options.dryRun ? "ready" : "inserted"} (${inserted.length}):`);
  for (const article of inserted) {
    console.log(`   • ${article.title}`);
    console.log(`     ${article.source_domain} · ${article.published_at}`);
  }

  console.log(`\n⏭️  Articles skipped (${skipped.length}):`);
  for (const article of skipped) {
    console.log(`   • ${article.title} — ${article.reason}`);
  }

  console.log("\n✨ Done.");
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  runCurator().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
