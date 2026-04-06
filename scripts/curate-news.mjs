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
// Curated April 6, 2026 — sources from early April 2026 and late March 2026
const ARTICLES = [
  {
    title: "When Data Handling Alters Physical Interpretation: HVAC's Missing Evidence Layer",
    url: "https://www.automatedbuildings.com/2026/04/when-data-handling-alters-physical-interpretation-hvacs-missing-evidence-layer/",
    slug: "when-data-handling-alters-physical-interpretation-k7n2m4p8",
    source_domain: "automatedbuildings.com",
    summary:
      "A 2026 study in Energy and AI (Guo et al.) shows that changing how missing sensor data is handled shifts ML conclusions about thermal comfort by 135%—with no change to the underlying building physics. The article argues BAS practitioners face a data provenance and governance gap, not just a modeling problem.",
    tags: ["analytics", "hvac", "ddc", "ai"],
  },
  {
    title: "How HVAC Contractors Can Navigate the 'Age of Electricity'",
    url: "https://www.achrnews.com/articles/166031-how-hvac-contractors-can-navigate-the-age-of-electricity",
    slug: "how-hvac-contractors-can-navigate-the-age-of-elect-b3r9v5x1",
    source_domain: "achrnews.com",
    summary:
      "Outlines a repeatable all-electric readiness playbook for contractors—covering load calculations, duct/distribution fixes, control strategy, and commissioning discipline—as electrification mandates accelerate and average contractor margins sit at just 5%. Controls engineers and integrators are identified as critical to any credible electrification transition.",
    tags: ["hvac", "controls", "commissioning", "energy"],
  },
  {
    title: "History: Convergence on AutomatedBuildings.com",
    url: "https://www.automatedbuildings.com/2026/04/history-convergence-on-automatedbuildings-com/",
    slug: "history-convergence-on-automatedbuildings-com-w6q4j2t8",
    source_domain: "automatedbuildings.com",
    summary:
      "Editor Ken Sinclair traces 27 years of convergence on the platform—from early IP-to-the-edge IoT through Project Haystack and Brick Schema semantic standards, to the current \"Platform Peace\" era where buildings self-configure and interact autonomously with the grid and AI agents. A strategic reference for integrators navigating open-standards adoption.",
    tags: ["smart-building", "iot", "bacnet", "controls"],
  },
  {
    title: "Honeywell Expands Security Portfolio in Bid to Catch AI Wave",
    url: "https://www.facilitiesdive.com/news/honeywell-expands-security-portfolio-in-bid-to-catch-ai-wave/815980/",
    slug: "honeywell-expands-security-portfolio-in-bid-to-cat-m5f1d9c7",
    source_domain: "facilitiesdive.com",
    summary:
      "Honeywell is partnering with Rhombus to deliver a cloud-native, AI-powered video and access-control platform sold through its existing channel and system-integrator network, with AI analytics that learn from normal building behavior and integrate directly into Honeywell's access-control stack. Significant for integrators managing converged physical-security and BAS installations.",
    tags: ["smart-building", "ai", "cybersecurity", "controls"],
  },
  {
    title: "ABB Launches Ability BuildingPro Suites to Unify Building and IoT Systems",
    url: "https://new.abb.com/news/detail/134002/abb-launches-ability-buildingpro-suites-to-unify-building-and-iot-systems-for-data-driven-performance",
    slug: "abb-launches-ability-buildingpro-suites-to-unify-b-h3p7n2s6",
    source_domain: "new.abb.com",
    summary:
      "Announced at Light + Building 2026, ABB's BuildingPro Suites is a modular software platform connecting BAS, HVAC, energy, IT, and IoT systems via an open, cybersecure architecture on a utilization-based (per data-point) model. Targets system integrators and building operators who want measurable performance outcomes without a full rip-and-replace.",
    tags: ["smart-building", "iot", "energy", "cybersecurity"],
  },
  {
    title: "Facility Security Teams Must Deploy AI With Intention or Risk Bloat Without Outcomes",
    url: "https://www.facilitiesdive.com/news/facility-security-teams-must-deploy-ai-with-intention-or-risk-bloat-without/815865/",
    slug: "facility-security-teams-must-deploy-ai-with-intent-r4k8w1v5",
    source_domain: "facilitiesdive.com",
    summary:
      "Integration firm Convergint warns that AI adoption in facility security is outpacing governance—adding sensors and analytics without clear use-case definition produces \"bloat without outcomes.\" Integrators and facility managers are advised to define success metrics and map AI tools to specific operational gaps before deployment, a lesson equally applicable to BAS analytics rollouts.",
    tags: ["ai", "smart-building", "cybersecurity", "controls"],
  },
  {
    title: "Energy Star Is Moving to DOE. Industry Groups Are Hopeful.",
    url: "https://www.utilitydive.com/news/energy-star-is-moving-to-doe-industry-groups-are-hopeful/814283/",
    slug: "energy-star-is-moving-to-doe-industry-groups-are-x9c3t6m2",
    source_domain: "utilitydive.com",
    summary:
      "A March 3 memorandum transfers EPA's Energy Star program to the Department of Energy under a 10-year agreement, with a 90-day IT and database migration underway. Facility managers and controls engineers relying on Energy Star benchmarking for compliance and retrofit planning should monitor the transition closely.",
    tags: ["energy", "sustainability", "retrofit"],
  },
  {
    title: "NFMT East 2026: Lowering Peak Energy Demand Can Provide Outsized Benefit",
    url: "https://www.facilitiesdive.com/news/nfmt-east-2026-lowering-peak-energy-demand-can-provide-outsized-benefit/814702/",
    slug: "nfmt-east-2026-lowering-peak-energy-demand-can-pro-f2b7n9k4",
    source_domain: "facilitiesdive.com",
    summary:
      "Conference recap from NFMT East 2026 covering how demand charges now approach $70/kW and how energy management systems combined with battery storage can dramatically cut those charges. Directly actionable for facility managers and controls engineers designing or retrofitting EMS and BAS demand-response logic.",
    tags: ["energy", "controls", "analytics", "smart-building"],
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
  console.log("🤖 BASidekick News Curator — April 6, 2026 — " + new Date().toISOString());
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
