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
// Curated April 2, 2026 — sources from March 23–30, 2026
const ARTICLES = [
  {
    title: "Your Smart Building Can't Explain Itself. Now We Know Why.",
    url: "https://www.automatedbuildings.com/2026/03/your-smart-building-cant-explain-itself-now-we-know-why/",
    slug: "your-smart-building-cant-explain-itself-now-we-kn-a3f7c8d2",
    source_domain: "automatedbuildings.com",
    summary:
      "A March 30 piece from AutomatedBuildings.com argues that smart buildings lack a shared semantic architecture, making AI decisions opaque and unauditable. The author calls for an 'Architect of Intelligence' role supported by AI agents that continuously validate and maintain system coherence across BAS subsystems over the building lifecycle.",
    tags: ["smart-building", "ai", "analytics", "controls"],
  },
  {
    title: "When Buildings Govern Themselves",
    url: "https://www.automatedbuildings.com/2026/03/when-buildings-govern-themselve/",
    slug: "when-buildings-govern-themselves-b9k2m5x1",
    source_domain: "automatedbuildings.com",
    summary:
      "Proposes replacing per-project custom integration work with a shared discovery-and-binding substrate built on open standards like ASHRAE 223P, turning the BAS 'integration tax' into a one-time architectural investment. Today's per-pair API key exchanges and custom glue code are identified as a fundamental antipattern preventing portable, auditable cross-platform integrations.",
    tags: ["smart-building", "bacnet", "controls", "iot"],
  },
  {
    title: "AI and the Building Operator",
    url: "https://www.automatedbuildings.com/2026/03/ai-and-the-building-operator/",
    slug: "ai-and-the-building-operator-c7m2n5r1",
    source_domain: "automatedbuildings.com",
    summary:
      "Published March 23, 2026, this AutomatedBuildings.com article explores practical AI workflows that translate directly into smart building operations, with a focus on open-source tools as a counterweight to the increasingly proprietary nature of HVAC and BAS systems. The author demonstrates how AI agents can coordinate tasks, choose models, and run diagnostic workflows that could replace manual technician processes.",
    tags: ["ai", "controls", "smart-building"],
  },
  {
    title: "Eaton Unveils AI-Powered Brightlayer Energy Management System",
    url: "https://www.buildings.com/products/energy-management/product/55366458/eaton-eaton-unveils-ai-powered-brightlayer-energy",
    slug: "eaton-unveils-ai-powered-brightlayer-energy-d4n8p3q7",
    source_domain: "buildings.com",
    summary:
      "Eaton launched Brightlayer Energy on March 25, 2026 — an AI-powered energy management and optimization system for commercial buildings with 99%-accurate load forecasting, automated demand response, and solar-plus-BESS optimization. The platform integrates real-time weather data to maximize on-site generation and dispatches stored energy to minimize peak demand charges while meeting local regulatory requirements.",
    tags: ["energy", "ai", "smart-building", "iot"],
  },
  {
    title: "5 Lessons for Scaling Smart Building Tech Across Large CRE Portfolios in 2026",
    url: "https://www.buildings.com/smart-buildings/article/55359552/5-lessons-for-scaling-smart-building-tech-across-large-cre-portfolios-in-2026",
    slug: "5-lessons-for-scaling-smart-building-tech-across-l-e6r1s5w9",
    source_domain: "buildings.com",
    summary:
      "Identifies key prerequisites for deploying smart building systems across large commercial real estate portfolios, including open data tagging standards for interoperability and cybersecurity embedded from the outset (network segmentation, encryption, MFA). Correctly implemented, the article reports 15–25% portfolio-wide energy savings as a realistic target, but warns that skipping data standardization first makes analytics layers ineffective.",
    tags: ["smart-building", "energy", "cybersecurity", "analytics"],
  },
  {
    title: "Urban AI: What It Means for Intelligent HVAC",
    url: "https://www.hpac.com/technology/blog/55342954/urban-ai-what-it-means-for-intelligent-hvac",
    slug: "urban-ai-what-it-means-for-intelligent-hvac-f2t7v4y8",
    source_domain: "hpac.com",
    summary:
      "HPAC Engineering examines 'Urban AI' — a paradigm shift for HVAC professionals that moves beyond building-level visibility to neighborhood-scale predictive infrastructure management, covering grid demand response and distributed energy optimization. The article notes that digital twins are evolving from static commissioning models into live operational systems connected directly to BAS sensors, schedules, and utility pricing signals.",
    tags: ["hvac", "ai", "smart-building", "energy"],
  },
  {
    title: "8 Takeaways from the Dragos 2026 OT Cybersecurity Report",
    url: "https://www.sans.org/blog/top-takeaways-from-the-dragos-ot-cybersecurity-report-2026",
    slug: "8-takeaways-dragos-2026-ot-cybersecurity-report-g3u9w6z2",
    source_domain: "sans.org",
    summary:
      "SANS Institute distills the 2026 Dragos OT Year in Review, highlighting that 26 threat groups now target ICS/OT — three new ones in 2025 — with ransomware impacting 3,300 industrial organizations, a 49% year-over-year surge. For BAS and controls environments, key recommendations include extending monitoring to engineering workstations, remote access infrastructure, and internet-facing edge devices, not just core OT networks.",
    tags: ["cybersecurity", "iot", "controls"],
  },
  {
    title: "AI + Buildings 2026: Redefining Autonomy from People to Portfolios",
    url: "https://www.automatedbuildings.com/2026/03/ai-buildings-2026-redefining-autonomy-from-people-to-portfolios-3/",
    slug: "ai-buildings-2026-redefining-autonomy-from-people-h5x1a4k7",
    source_domain: "automatedbuildings.com",
    summary:
      "An AutomatedBuildings.com roundtable examines the industry shift from reactive if/then BAS logic to AI agent systems that negotiate power, predict maintenance, and optimize for cost, carbon, and comfort across entire portfolios simultaneously. Panelists identify data silos between lighting, HVAC, and access control — plus the lack of explainable AI — as the primary obstacles preventing portfolio-scale autonomous building operations.",
    tags: ["smart-building", "ai", "analytics", "energy"],
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
