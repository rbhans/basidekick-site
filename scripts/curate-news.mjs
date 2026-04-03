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
// Curated April 3, 2026 — sources from April 1–3, 2026
const ARTICLES = [
  {
    title: "CUBE Announces Strategic Partnership with Rizzo Controls: Revolutionizing BMS Service Operations",
    url: "https://www.automatedbuildings.com/2026/04/cube-announces-strategic-partnership-with-rizzo-controls-revolutionizing-bms-service-operations/",
    slug: "cube-announces-strategic-partnership-with-rizzo-c-m8x3b5n2",
    source_domain: "automatedbuildings.com",
    summary:
      "CUBE USA and Rizzo Controls are joining forces to help BMS service contractors structure operational data from their Niagara environments into actionable workflows, moving teams beyond reactive maintenance. Rizzo Controls, known for Niagara 4 training and technical enablement, will drive implementation and training of the CUBE platform across the Niagara market.",
    tags: ["niagara", "tridium", "smart-building", "controls", "ddc"],
  },
  {
    title: "Annoying Acronyms of AI, Automation, and Cloud Services — The Decoder Page",
    url: "https://www.automatedbuildings.com/2026/04/annoying-acronyms-of-ai-automation-and-cloud-services-the-decoder-page/",
    slug: "annoying-acronyms-of-ai-automation-and-cloud-serv-k9p2r7q1",
    source_domain: "automatedbuildings.com",
    summary:
      "AutomatedBuildings.com launches a living glossary translating the fast-multiplying acronyms of AI, cloud, and data standards — including RDF, TTL/Turtle, CDL, and CXF — that are rapidly entering BAS and smart-building workflows. A practical reference for controls engineers and integrators connecting semantic data standards to real building systems.",
    tags: ["smart-building", "ai", "iot", "controls"],
  },
  {
    title: "Five Global Trends Reshaping Building Automation",
    url: "https://www.johnsoncontrols.com/building-insights/2026/thought-leadership/five-global-trends-reshaping-building-automation",
    slug: "five-global-trends-reshaping-building-automation-j4w6t8s5",
    source_domain: "johnsoncontrols.com",
    summary:
      "Johnson Controls identifies rising utility costs (wholesale prices projected up 19% by 2028), stricter regulations, aging infrastructure, and workforce shortages as the primary forces accelerating BAS modernization — with agentic AI, open-standards interoperability, and plug-and-play retrofit technology as the main response levers. Directly relevant to integrators and engineers advising clients on BAS upgrade strategy.",
    tags: ["smart-building", "ai", "energy", "retrofit", "controls", "sustainability"],
  },
  {
    title: "CxEnergy 2026 Technical Program and Keynote Announced",
    url: "https://www.csemag.com/cxenergy-2026-technical-program-and-keynote-announced/",
    slug: "cxenergy-2026-technical-program-and-keynote-annou-h7v1d3f6",
    source_domain: "csemag.com",
    summary:
      "CxEnergy 2026 (April 21–24, Chicago) opens with a keynote on practical AI for commissioning and energy professionals, covering how AI tools increase revenue-per-engineer and reduce documentation burden. The full technical program spans AI/ML in BAS, ASHRAE Guideline 36 implementation, fault detection diagnostics, and energy management — highly relevant to commissioning authorities and controls engineers.",
    tags: ["commissioning", "ai", "analytics", "energy", "controls", "ashrae"],
  },
  {
    title: "Honeywell Spin-Off Plans Leave Building Automation at Core",
    url: "https://www.facilitiesdive.com/news/honeywell-spin-off-plans-leave-building-automation-at-core/803711/",
    slug: "honeywell-spin-off-plans-leave-building-automation-n3y8c4g9",
    source_domain: "facilitiesdive.com",
    summary:
      "Honeywell's planned three-way split places Building Automation as a standalone reporting segment starting Q1 2026, led by Billal Hammoud as president and CEO. For integrators and specifiers, this signals Honeywell is doubling down on its BAS portfolio — including Niagara/Connected Solutions — as a dedicated business rather than a sub-unit of a diversified conglomerate.",
    tags: ["smart-building", "controls", "niagara", "energy", "hvac"],
  },
  {
    title: "Urban AI: What It Means for Intelligent HVAC",
    url: "https://www.hpac.com/technology/blog/55342954/urban-ai-what-it-means-for-intelligent-hvac",
    slug: "urban-ai-what-it-means-for-intelligent-hvac-p5m2j7k8",
    source_domain: "hpac.com",
    summary:
      "HPAC Engineering examines how 'Urban AI' — city-scale machine learning applied to building clusters — is beginning to influence HVAC setpoint optimization, demand-response coordination, and predictive maintenance at the district level. Controls engineers will find this useful for understanding how building-level BAS decisions will increasingly be influenced by grid and neighborhood-scale signals.",
    tags: ["hvac", "ai", "energy", "controls", "analytics", "smart-building"],
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
  console.log("🤖 BASidekick News Curator — " + new Date().toISOString());
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
