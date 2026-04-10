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
// Curated April 10, 2026 — sources from April 6-10, 2026
const ARTICLES = [
  {
    title: "Ten Years of IoT in Building Automation: 2016 to 2026",
    url: "https://www.automatedbuildings.com/2026/04/ten-years-of-iot-in-building-automation-2016-to-2026/",
    slug: "ten-years-of-iot-in-building-automation-2016-m4k9r2j7",
    source_domain: "automatedbuildings.com",
    summary:
      "A decade-spanning retrospective from AutomatedBuildings.com examines how IoT has transformed BAS — from isolated field controllers and proprietary buses to cloud-connected, AI-augmented systems monitoring HVAC, lighting, and energy in real time across entire portfolios.",
    tags: ["iot", "smart-building", "analytics", "controls"],
  },
  {
    title: "The Building Revolution: Is AI About to Eat Your Smart Building Stack?",
    url: "https://www.automatedbuildings.com/2026/04/the-building-revolution-is-ai-about-to-eat-your-smart-building-stack/",
    slug: "the-building-revolution-is-ai-about-to-eat-your-sm-b9v4w2c5",
    source_domain: "automatedbuildings.com",
    summary:
      "AutomatedBuildings.com examines how AI agents and large language models are beginning to automate tasks — from BAS programming and commissioning to fault detection — that traditional middleware layers currently handle, challenging integrators and controls vendors to redefine their value proposition.",
    tags: ["ai", "smart-building", "controls", "analytics"],
  },
  {
    title: "In Conversation with Rudolf Erasmus, Hardware Manager at Reliable Controls",
    url: "https://www.automatedbuildings.com/2026/04/in-conversation-with-rudolf-erasmus/",
    slug: "in-conversation-with-rudolf-erasmus-p2j6n4k8",
    source_domain: "automatedbuildings.com",
    summary:
      "Reliable Controls Hardware Manager Rudolf Erasmus discusses the company's BACnet controller roadmap — including 10BASE-T1L Ethernet field devices showcased at Niagara Summit 2026 — and the engineering philosophy behind open-protocol, long-lifecycle BAS hardware.",
    tags: ["bacnet", "controls", "iot", "smart-building"],
  },
  {
    title: "Lowering Peak Energy Demand Can Provide Outsized Benefit, Executive Tells Facilities Managers",
    url: "https://www.utilitydive.com/news/nfmt-east-2026-lowering-peak-energy-demand-can-provide-outsized-benefit/814803/",
    slug: "lowering-peak-energy-demand-can-provide-outsized-b-r7m3v9k1",
    source_domain: "utilitydive.com",
    summary:
      "At NFMT East 2026, a Sanalife executive presented data showing that peak demand reduction through BAS scheduling and load-shifting delivers higher ROI than base load efficiency measures, with commercial buildings achieving 15–30% cuts in peak demand charges through optimized HVAC sequencing.",
    tags: ["energy", "smart-building", "controls", "analytics"],
  },
  {
    title: "Energy Savings to Push Electrification Forward in 2026 Despite Federal Headwinds",
    url: "https://www.facilitiesdive.com/news/electrification-outlook-trends-heat-pumps-ev-/810541/",
    slug: "energy-savings-to-push-electrification-forward-in-q5k8t2w3",
    source_domain: "facilitiesdive.com",
    summary:
      "Despite the expiration of federal heat pump tax credits under the Big Beautiful Bill, facilities managers are advancing electrification projects in 2026 driven by state rebate programs, utility incentives, and mandatory building performance standards — with heat pump and EV charging integration requiring updated BAS sequences.",
    tags: ["hvac", "energy", "retrofit", "sustainability"],
  },
  {
    title: "Inflation Reduction Act Rollbacks Could Reshape Heat Pump Demand",
    url: "https://www.contractingbusiness.com/industry-news/news/55360531/inflation-reduction-act-rollbacks-could-reshape-heat-pump-demand",
    slug: "inflation-reduction-act-rollbacks-could-reshape-he-n6b3p7m4",
    source_domain: "contractingbusiness.com",
    summary:
      "Contracting Business reports on how the elimination of the federal 30% heat pump tax credit effective January 2026 is shifting commercial HVAC electrification momentum, even as state rebate programs and building performance mandates continue to sustain demand for heat pump retrofits and associated controls upgrades.",
    tags: ["hvac", "energy", "retrofit"],
  },
  {
    title: "Manufacturers Brace for a Slow Start — but See HVACR Growth Ahead in 2026",
    url: "https://www.achrnews.com/articles/165635-manufacturers-brace-for-a-slow-start-but-see-hvacr-growth-ahead-in-2026",
    slug: "manufacturers-brace-for-a-slow-start-but-see-hvacr-j8w2k9v5",
    source_domain: "achrnews.com",
    summary:
      "ACHR News surveys HVACR manufacturers who entered 2026 cautiously after IRA rollbacks and tariff uncertainty, but project growth accelerating through mid-year as commercial construction, data center cooling demand, and the A2L refrigerant transition deadline drive equipment and controls upgrades.",
    tags: ["hvac", "energy", "controls"],
  },
  {
    title: "New Software Could Cut Cooling Energy Use by 25% in Data Centers",
    url: "https://www.psu.edu/news/research/story/new-software-could-cut-cooling-energy-use-25-data-centers",
    slug: "new-software-could-cut-cooling-energy-use-by-25-c3q7v1p9",
    source_domain: "psu.edu",
    summary:
      "Penn State researchers announced a physics-based AI system that dynamically adjusts data center cooling based on real-time weather and electricity pricing, achieving up to 25% cooling energy reductions — a technique directly applicable to BAS-managed chiller and CRAC unit sequencing in large facilities.",
    tags: ["analytics", "ai", "energy", "hvac"],
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
  console.log("BASidekick News Curator — April 10, 2026 (batch 2) — " + new Date().toISOString());
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
