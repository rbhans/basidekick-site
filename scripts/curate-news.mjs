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
// Curated April 7, 2026 — sources from April 2026 and late March 2026
const ARTICLES = [
  {
    title: "FYI: News Briefs in HVAC — April 6, 2026",
    url: "https://www.achrnews.com/articles/166038-fyi-news-briefs-in-hvac-april-6-2026",
    slug: "fyi-news-briefs-in-hvac-april-6-2026-k4m7n2p9",
    source_domain: "achrnews.com",
    summary:
      "ACHR News' weekly industry roundup covering USMCA review uncertainty and new tariff pressures affecting HVAC equipment supply chains, alongside product and industry news relevant to contractors and controls engineers.",
    tags: ["hvac", "controls", "energy"],
  },
  {
    title: "As Facilities Increase AI Use, Cyber Threats Loom as a Constraint",
    url: "https://www.facilitiesdive.com/news/as-facilities-increase-ai-use-cyber-threats-loom-as-a-constraint/814314/",
    slug: "as-facilities-increase-ai-use-cyber-threats-loom-a-q8r3t5w1",
    source_domain: "facilitiesdive.com",
    summary:
      "Johnson Controls' 2026 survey of 1,000+ facility managers finds 60%+ are using AI for energy optimization and building system efficiency, yet nearly a quarter cite cybersecurity and data privacy as the biggest barrier to expanding AI adoption in building operations.",
    tags: ["ai", "cybersecurity", "energy", "smart-building", "analytics"],
  },
  {
    title: "Honeywell and Rhombus Introduce AI-Driven Cloud Video and Access Solution",
    url: "https://www.prnewswire.com/news-releases/honeywell-and-rhombus-introduce-ai-driven-cloud-video-and-access-solution-to-modernize-building-security-302725531.html",
    slug: "honeywell-and-rhombus-introduce-ai-driven-cloud-vi-b5c9f2k7",
    source_domain: "prnewswire.com",
    summary:
      "Honeywell and Rhombus have partnered to deliver a cloud-native, AI-powered video and access control platform deployable as an overlay on existing building security infrastructure and distributed through Honeywell's system integrator channel — eliminating the need for a full rip-and-replace.",
    tags: ["smart-building", "ai", "cybersecurity", "iot", "retrofit"],
  },
  {
    title: "Siemens Showcases Building Automation Modernization at AHR Expo 2026",
    url: "https://news.siemens.com/en-us/modernization-solutions-ahr-expo-2026/",
    slug: "siemens-showcases-building-automation-modernizatio-n3p6v8x2",
    source_domain: "news.siemens.com",
    summary:
      "Siemens highlighted its Desigo PXC 4/5/7 HVAC controller family at AHR Expo 2026, supporting BACnet Secure Connect and open protocol integration, alongside Desigo CC V9 and Siemens SLX on Niagara Framework — all emphasizing stepwise modernization without full system replacement for integrators managing aging BAS infrastructure.",
    tags: ["bacnet", "niagara", "controls", "hvac", "ddc", "retrofit", "cybersecurity"],
  },
  {
    title: "Niagara Summit 2026: Niagara 5 Previews, Building Data APIs, and AI Use Cases",
    url: "https://www.tridium.com/us/en/niagarasummit",
    slug: "niagara-summit-2026-event-hub-j7m4r9k1",
    source_domain: "tridium.com",
    summary:
      "Tridium's annual Niagara Summit (April 7–9, National Harbor MD) features early-access Niagara 5 developer previews, Building Data Service APIs for cloud app development, AI/GenAI use cases in building automation, and cross-protocol interoperability sessions covering BACnet, Modbus, LonWorks, and KNX — plus a limited-time JACE 8000→9000 license transfer promotion through June 2026.",
    tags: ["niagara", "tridium", "bacnet", "modbus", "controls", "iot", "ai"],
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
  console.log("🤖 BASidekick News Curator — April 7, 2026 — " + new Date().toISOString());
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
