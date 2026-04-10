#!/usr/bin/env node
/**
 * BASidekick News Curator
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=eyJ... \
 *   node scripts/curate-news.mjs
 *
 * Requires:
 *   - SUPABASE_URL  (same as NEXT_PUBLIC_SUPABASE_URL)
 *   - SUPABASE_SERVICE_KEY  (service role key, bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── ARTICLES TO INSERT ───────────────────────────────────────────────────────
// Curated April 10, 2026 — sources from April 6-10, 2026 (with select March items)
const ARTICLES = [
  {
    title: "SANS 2026 Report Flags Cybersecurity Skills Crisis, Putting Critical Infrastructure and OT Sectors at Measurable Breach Risk",
    url: "https://industrialcyber.co/reports/sans-2026-report-flags-cybersecurity-skills-crisis-putting-critical-infrastructure-and-ot-sectors-at-measurable-breach-risk/",
    slug: "sans-2026-report-flags-cybersecurity-skills-crisis-x9b4m7k2",
    source_domain: "industrialcyber.co",
    summary:
      "The SANS/GIAC 2026 Cybersecurity Workforce Research Report, released at RSAC 2026, finds that skills gaps have overtaken headcount shortages as the top workforce challenge — with 60% of organizations lacking adequate OT security skills and 27% reporting breaches directly linked to capability deficits.",
    tags: ["cybersecurity", "controls", "iot"],
  },
  {
    title: "All Emerging Cyber Threats Targeting Power Infrastructure at a Glance",
    url: "https://pv-magazine-usa.com/2026/04/06/all-emerging-cyber-threats-targeting-power-infrastructure-at-a-glance/",
    slug: "all-emerging-cyber-threats-targeting-power-infrast-p4q8n3j6",
    source_domain: "pv-magazine-usa.com",
    summary:
      "A comprehensive April 6 roundup of active threat actors targeting power and energy infrastructure — covering ransomware groups, nation-state APTs, and supply chain attacks — with direct relevance for building operators managing grid-connected HVAC, solar, and EV charging systems.",
    tags: ["cybersecurity", "energy", "iot"],
  },
  {
    title: "2026: The Year Buildings Come of Age",
    url: "https://new.abb.com/news/detail/132579/2026-the-year-buildings-come-of-age",
    slug: "2026-the-year-buildings-come-of-age-n7k2w5p1",
    source_domain: "new.abb.com",
    summary:
      "ABB's 2026 outlook frames this year as the moment buildings reach operational maturity — with AI, electrified HVAC, grid flexibility, and interoperable data infrastructure shifting from pilots to standard practice as commercial buildings face pressure to cut energy use 10–30% by 2030.",
    tags: ["smart-building", "energy", "ai", "iot"],
  },
  {
    title: "Five Global Trends Reshaping Building Automation",
    url: "https://www.johnsoncontrols.com/building-insights/2026/thought-leadership/five-global-trends-reshaping-building-automation",
    slug: "five-global-trends-reshaping-building-automation-m3v9t7c1",
    source_domain: "johnsoncontrols.com",
    summary:
      "Johnson Controls identifies data center growth, AI integration, grid flexibility, sustainability mandates, and workforce transformation as the five forces reshaping global building automation investment and system design throughout 2026.",
    tags: ["smart-building", "ai", "energy", "controls"],
  },
  {
    title: "HVAC Equipment Sector M&A Update – April 2026",
    url: "https://www.capstonepartners.com/insights/article-hvac-equipment-sector-ma-update/",
    slug: "hvac-equipment-sector-m-a-update-april-2026-r8k4v2p5",
    source_domain: "capstonepartners.com",
    summary:
      "Capstone Partners' April 2026 report shows 17 acquisitions YTD in HVAC equipment with deal flow accelerating around controls/AI and data center cooling — including Trane Technologies' completed Stellar Energy buy and NexCore's tuck-in of building controls firm FX Automation.",
    tags: ["hvac", "energy", "controls"],
  },
  {
    title: "Building Operations Are Increasingly Strategic: NFMT East 2026",
    url: "https://www.facilitiesdive.com/news/building-operations-are-increasingly-strategic-nfmt-east-2026/815275/",
    slug: "building-operations-are-increasingly-strategic-nfm-t3j7v9k5",
    source_domain: "facilitiesdive.com",
    summary:
      "Coverage from NFMT East 2026 highlights how facilities leaders are elevating building operations as a core organizational asset, with sessions from Johnson Controls and Automated Logic on BMS best practices and how real-time data-driven operations support resilience and sustainability goals.",
    tags: ["smart-building", "energy", "analytics", "controls"],
  },
  {
    title: "Blog: Latest from Tridium and What's Ahead",
    url: "https://www.stromquist.com/blog/1009/blog-latest-from-tridium-and-what-s-ahead",
    slug: "blog-latest-from-tridium-and-what-s-ahead-q2n8m4r7",
    source_domain: "stromquist.com",
    summary:
      "Stromquist's Niagara Summit 2026 recap covers Tridium's Niagara 5 roadmap — confirming Niagara 4.15 as the final N4 release and laying out N5's timeline with a Java 21 base, built-in AI for auto-discovery and FDD, and general availability targeted for Q4 2026.",
    tags: ["niagara", "tridium", "controls", "smart-building"],
  },
];

// ─── STEP 1: RETIRE STALE AI ARTICLES ────────────────────────────────────────
async function retireStaleArticles() {
  console.log("\n📤 Step 1: Retiring stale AI-curated articles (older than 7 days)...");
  const { data, error, count } = await supabase
    .from("news_articles")
    .update({ is_published: false, updated_at: new Date().toISOString() })
    .eq("is_ai_submitted", true)
    .eq("is_published", true)
    .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .select("id");

  if (error) {
    console.error("  ❌ Error retiring articles:", error.message);
    return 0;
  }
  const retiredCount = data?.length ?? 0;
  console.log(`  ✅ Retired ${retiredCount} stale articles`);
  return retiredCount;
}

// ─── STEP 2: GET EXISTING URLS ────────────────────────────────────────────────
async function getExistingUrls() {
  console.log("\n🔍 Step 2: Fetching existing article URLs (last 30 days)...");
  const { data, error } = await supabase
    .from("news_articles")
    .select("url")
    .gt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error("  ❌ Error fetching URLs:", error.message);
    return new Set();
  }
  const urls = new Set(data.map((r) => r.url));
  console.log(`  ✅ Found ${urls.size} existing URLs`);
  return urls;
}

// ─── STEP 3 & 4: INSERT NEW ARTICLES ─────────────────────────────────────────
async function insertArticles(existingUrls) {
  console.log("\n📥 Step 3-4: Inserting new articles...");
  const inserted = [];
  const skipped = [];

  for (const article of ARTICLES) {
    if (existingUrls.has(article.url)) {
      skipped.push({ ...article, reason: "duplicate URL" });
      console.log(`  ⏭️  Skipped (duplicate): ${article.title}`);
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
        published_at: new Date().toISOString(),
      },
      { onConflict: "url", ignoreDuplicates: true }
    );

    if (error) {
      console.error(`  ❌ Failed to insert "${article.title}":`, error.message);
      skipped.push({ ...article, reason: error.message });
    } else {
      inserted.push(article);
      console.log(`  ✅ Inserted: ${article.title}`);
    }
  }

  return { inserted, skipped };
}

// ─── STEP 5: REPORT ──────────────────────────────────────────────────────────
async function getActiveAiCount() {
  const { count, error } = await supabase
    .from("news_articles")
    .select("*", { count: "exact", head: true })
    .eq("is_ai_submitted", true)
    .eq("is_published", true);

  if (error) {
    console.error("  ❌ Error counting active articles:", error.message);
    return "?";
  }
  return count;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("BASidekick News Curator — April 10, 2026 — " + new Date().toISOString());
  console.log("=".repeat(60));

  const retiredCount = await retireStaleArticles();
  const existingUrls = await getExistingUrls();
  const { inserted, skipped } = await insertArticles(existingUrls);
  const activeCount = await getActiveAiCount();

  console.log("\n" + "=".repeat(60));
  console.log("📊 CURATION REPORT");
  console.log("=".repeat(60));
  console.log(`\n📤 Articles retired:    ${retiredCount}`);
  console.log(`\n✅ Articles inserted (${inserted.length}):`);
  for (const a of inserted) {
    console.log(`   • ${a.title}`);
    console.log(`     ${a.source_domain}`);
  }
  console.log(`\n⏭️  Articles skipped (${skipped.length}):`);
  for (const a of skipped) {
    console.log(`   • ${a.title} — ${a.reason}`);
  }
  console.log(`\n📈 Active AI articles:  ${activeCount}`);
  console.log("\n✨ Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
